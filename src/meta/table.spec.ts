/* eslint-disable import/no-dynamic-require, @typescript-eslint/no-require-imports -- needed to load fixtues */

import path from "node:path";

/* mock ajv for easier testing of errors and to allow invalid values though the
 * validation to ensure the code works anyway */
interface Validate {
	(): boolean;
	errors: any[];
}
const validate: Validate = (): boolean => {
	return validate.errors.length === 0;
};
validate.errors = [] as any[];
jest.mock("ajv", () => {
	class MockAjv {
		public compile(): () => boolean {
			return validate;
		}
		public addMetaSchema(): void {
			/* do nothing */
		}
		public addKeyword(): void {
			/* do nothing */
		}
	}
	return MockAjv;
});

/* a mocked file which throws an exception when loaded */
jest.mock(
	"invalid-file.json",
	() => {
		throw new Error("mocked error");
	},
	{ virtual: true },
);

import { ResolvedConfig } from "../config";
import { SchemaValidationError, InheritError } from "../error";
import { Parser } from "../parser";
import { type MetaData, type MetaDataTable } from "./element";
import { MetaTable } from "./table";

describe("MetaTable", () => {
	beforeEach(() => {
		validate.errors = [];
	});

	describe("should migrate old formats", () => {
		it("attributes string to object", () => {
			expect.assertions(1);
			const table = new MetaTable();
			table.loadFromObject({
				foo: {
					attributes: {
						"my-attr": ["a"],
					},
				},
			});
			expect(table.getMetaFor("foo")).toEqual(
				expect.objectContaining({
					attributes: {
						"my-attr": {
							enum: ["a"],
						},
					},
				}),
			);
		});
	});

	it("should throw SchemaValidationError if object does not validate", () => {
		expect.assertions(2);
		validate.errors = [
			{
				keyword: "additionalProperties",
				dataPath: "/foo",
				schemaPath: "#/patternProperties/%5E.*%24/additionalProperties",
				params: { additionalProperty: "invalid" },
				message: "should NOT have additional properties",
			},
		];
		const table = new MetaTable();
		const fn = (): void => {
			table.loadFromObject({
				foo: mockEntry({ invalid: true } as unknown as Partial<MetaData>),
			});
		};
		expect(fn).toThrow(SchemaValidationError);
		expect(fn).toThrow(
			"Element metadata is not valid: /foo Property invalid is not expected to be here",
		);
	});

	it("should throw SchemaValidationError if file does not validate", () => {
		expect.assertions(2);
		const filename = path.resolve(__dirname, "../../test-files/meta/invalid-schema.json");
		const table = new MetaTable();
		const data = require(filename);
		validate.errors = [
			{
				keyword: "additionalProperties",
				dataPath: "/foo",
				schemaPath: "#/patternProperties/%5E.*%24/additionalProperties",
				params: { additionalProperty: "invalid" },
				message: "should NOT have additional properties",
			},
		];
		expect(() => {
			table.loadFromObject(data, filename);
		}).toThrow(SchemaValidationError);
		expect(() => {
			table.loadFromObject(data, filename);
		}).toThrow("Element metadata is not valid: /foo Property invalid is not expected to be here");
	});

	it("should throw InheritError if inheritance could not be resolved", () => {
		expect.assertions(2);
		const filename = path.resolve(__dirname, "../../test-files/meta/invalid-inherit.json");
		const table = new MetaTable();
		const data = require(filename);
		expect(() => {
			table.loadFromObject(data, filename);
		}).toThrow(InheritError);
		expect(() => {
			table.loadFromObject(data, filename);
		}).toThrowErrorMatchingInlineSnapshot(
			`"Element <foo> cannot inherit from <bar>: no such element"`,
		);
	});

	it("should augment exception with filename if provided", () => {
		expect.assertions(1);
		const table = new MetaTable();
		const data = { foo: {} };
		jest.spyOn(table as unknown as any, "addEntry").mockImplementation(() => {
			throw new Error("Mock error");
		});
		expect(() => {
			table.loadFromObject(data, "my-file.json");
		}).toThrowErrorMatchingInlineSnapshot(`"Failed to load element metadata from "my-file.json""`);
	});

	it("should throw original exception if no filename if provided", () => {
		expect.assertions(1);
		const table = new MetaTable();
		const data = { foo: {} };
		jest.spyOn(table as unknown as any, "addEntry").mockImplementation(() => {
			throw new Error("Mock error");
		});
		expect(() => {
			table.loadFromObject(data);
		}).toThrowErrorMatchingInlineSnapshot(`"Mock error"`);
	});

	it("should ignore $schema property", () => {
		expect.assertions(2);
		const table = new MetaTable();
		table.loadFromObject({
			$schema: "https://example.net/schema.json",
			foo: {
				flow: true,
			},
		} as unknown as MetaDataTable);
		expect(table.getMetaFor("foo")).toBeDefined();
		expect(table.getMetaFor("$schema")).toBeNull();
	});

	describe("getMetaFor", () => {
		let table: MetaTable;

		beforeEach(() => {
			table = new MetaTable();
		});

		it("should be populated for known elements", () => {
			expect.assertions(2);
			table.loadFromObject({
				foo: mockEntry({ phrasing: true }),
			});
			const meta = table.getMetaFor("foo");
			expect(meta).toBeDefined();
			expect(meta?.tagName).toBe("foo");
		});

		it("should be global element for unknown elements", () => {
			expect.assertions(2);
			table.loadFromObject({
				"*": mockEntry({ phrasing: true }),
			});
			const meta = table.getMetaFor("foo");
			expect(meta).toBeDefined();
			expect(meta?.tagName).toBe("*");
		});

		it("should be null for unknown elements", () => {
			expect.assertions(1);
			table.loadFromObject({});
			const meta = table.getMetaFor("foo");
			expect(meta).toBeNull();
		});

		it("should be case insensitive", () => {
			expect.assertions(2);
			table.loadFromObject({
				foo: mockEntry({ phrasing: true }),
			});
			const meta = table.getMetaFor("FOO");
			expect(meta).toBeDefined();
			expect(meta?.tagName).toBe("foo");
		});
	});

	it("should expand category when callback is provided", () => {
		expect.assertions(2);
		const metaTable = new MetaTable();
		metaTable.loadFromObject({
			foo: mockEntry({
				interactive(node) {
					return node.hasAttribute("interactive");
				},
			}),
		});
		const config = new ResolvedConfig(
			{
				metaTable,
				plugins: [],
				rules: new Map(),
				transformers: [],
			},
			{},
		);
		const parser = new Parser(config);
		const markup = /* HTML */ `
			<foo id="first"></foo>
			<foo id="second" interactive></foo>
		`;
		const dom = parser.parseHtml(markup);
		const elements = dom.getElementsByTagName("foo");
		expect(elements[0].meta?.interactive).toBeFalsy();
		expect(elements[1].meta?.interactive).toBeTruthy();
	});

	describe("regexp", () => {
		it("should expand regular expression from string", () => {
			expect.assertions(2);
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({
					attributes: {
						attr: { enum: ["/foo/"] },
					},
				}),
			});
			const meta = table.getMetaFor("foo");
			expect(meta).toBeDefined();
			expect(meta?.attributes).toEqual({
				attr: { enum: [/^foo$/] },
			});
		});

		it("should handle case-insensitive flag", () => {
			expect.assertions(2);
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({
					attributes: {
						attr: { enum: ["/foo/i"] },
					},
				}),
			});
			const meta = table.getMetaFor("foo");
			expect(meta).toBeDefined();
			expect(meta?.attributes).toEqual({
				attr: { enum: [/^foo$/i] },
			});
		});

		it("should handle explicit anchors", () => {
			expect.assertions(2);
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({
					attributes: {
						attr: { enum: ["/^foo/", "/bar$/", "/^baz$/"] },
					},
				}),
			});
			const meta = table.getMetaFor("foo");
			expect(meta).toBeDefined();
			expect(meta?.attributes).toEqual({
				attr: { enum: [/^foo/, /bar$/, /^baz$/] },
			});
		});

		it("should handle escaped slash", () => {
			expect.assertions(2);
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({
					attributes: {
						attr: { enum: ["/foo\\/bar/"] },
					},
				}),
			});
			const meta = table.getMetaFor("foo");
			expect(meta).toBeDefined();
			expect(meta?.attributes).toEqual({
				attr: { enum: [/^foo\/bar$/] },
			});
		});

		it("should retain literal regexp", () => {
			expect.assertions(2);
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({
					attributes: {
						attr: { enum: [/foo/] },
					},
				}),
			});
			const meta = table.getMetaFor("foo");
			expect(meta).toBeDefined();
			expect(meta?.attributes).toEqual({
				attr: { enum: [/foo/] },
			});
		});
	});

	describe("global element", () => {
		it("should handle when global element is missing", () => {
			expect.assertions(1);
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry(),
			});
			expect(() => {
				table.init();
			}).not.toThrow();
		});

		it("should be merged with element", () => {
			expect.assertions(1);
			const table = new MetaTable();
			table.loadFromObject({
				"*": mockEntry({
					attributes: {
						a: { enum: ["1"] },
					},
				}),
				foo: mockEntry(),
			});
			table.init();
			const meta = table.getMetaFor("foo");
			expect(meta).toEqual(
				expect.objectContaining({
					attributes: {
						a: { enum: ["1"] },
					},
				}),
			);
		});

		it("should have lower priority than merged element", () => {
			expect.assertions(1);
			const table = new MetaTable();
			table.loadFromObject({
				"*": mockEntry({
					attributes: {
						a: { enum: ["1"] },
						b: { enum: ["2"] },
					},
				}),
				foo: mockEntry({
					attributes: {
						b: { enum: ["3"] },
						c: { enum: ["4"] },
					},
				}),
			});
			table.init();
			const meta = table.getMetaFor("foo");
			expect(meta).toEqual(
				expect.objectContaining({
					attributes: {
						a: { enum: ["1"] },
						b: { enum: ["3"] },
						c: { enum: ["4"] },
					},
				}),
			);
		});
	});

	describe("inheritance", () => {
		it("should be supported", () => {
			expect.assertions(1);
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({
					flow: true,
				}),
				bar: {
					inherit: "foo",
				} as MetaData,
			});
			const bar = table.getMetaFor("bar");
			expect(bar).toEqual(
				expect.objectContaining({
					tagName: "bar",
					flow: true,
					phrasing: false,
				}),
			);
		});

		it("should be implied when a previous element of the same name exists", () => {
			expect.assertions(1);
			const table = new MetaTable();
			table.loadFromObject({
				foo: {
					flow: true,
				},
			});
			table.loadFromObject({
				foo: {
					phrasing: true,
				},
			});
			const foo = table.getMetaFor("foo");
			expect(foo).toEqual(
				expect.objectContaining({
					tagName: "foo",
					flow: true,
					phrasing: true,
				}),
			);
		});

		it("should allow overriding", () => {
			expect.assertions(1);
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({
					flow: true,
					phrasing: true,
				}),
				bar: {
					inherit: "foo",
					flow: false,
				} as MetaData,
			});
			const bar = table.getMetaFor("bar");
			expect(bar).toEqual(
				expect.objectContaining({
					tagName: "bar",
					flow: false,
					phrasing: true,
				}),
			);
		});

		it("should merge objects", () => {
			expect.assertions(2);
			const table = new MetaTable();
			table.loadFromObject({
				foo: {
					attributes: {
						a: { enum: ["1"] },
						b: { enum: ["1"] },
						c: { enum: ["1"] },
					},
				},
				bar: {
					inherit: "foo",
					attributes: {
						b: { enum: ["2"] },
						c: null,
					},
				},
			});
			table.loadFromObject({
				foo: {
					attributes: {
						a: { enum: ["2"] },
						b: null,
					},
				},
			});
			const foo = table.getMetaFor("foo");
			const bar = table.getMetaFor("bar");
			expect(foo).toMatchInlineSnapshot(`
				{
				  "aria": {
				    "implicitRole": [Function],
				    "naming": [Function],
				  },
				  "attributes": {
				    "a": {
				      "enum": [
				        "2",
				      ],
				    },
				    "c": {
				      "enum": [
				        "1",
				      ],
				    },
				  },
				  "focusable": false,
				  "implicitRole": [Function],
				  "tagName": "foo",
				  "templateRoot": false,
				}
			`);
			expect(bar).toMatchInlineSnapshot(`
				{
				  "aria": {
				    "implicitRole": [Function],
				    "naming": [Function],
				  },
				  "attributes": {
				    "a": {
				      "enum": [
				        "1",
				      ],
				    },
				    "b": {
				      "enum": [
				        "2",
				      ],
				    },
				  },
				  "focusable": false,
				  "implicitRole": [Function],
				  "inherit": "foo",
				  "tagName": "bar",
				  "templateRoot": false,
				}
			`);
		});

		it("should throw error when extending missing element", () => {
			expect.assertions(1);
			const table = new MetaTable();
			expect(() => {
				table.loadFromObject({
					foo: {
						inherit: "bar",
					} as MetaData,
				});
			}).toThrow("Element <foo> cannot inherit from <bar>: no such element");
		});
	});

	describe("getTagsWithProperty()", () => {
		it("should return list of all tags with given property enabled", () => {
			expect.assertions(2);
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({
					flow: true,
				}),
				bar: mockEntry({
					flow: true,
					phrasing: true,
				}),
			});
			expect(table.getTagsWithProperty("flow")).toEqual(["foo", "bar"]);
			expect(table.getTagsWithProperty("phrasing")).toEqual(["bar"]);
		});

		it("should return empty list if nothing matches", () => {
			expect.assertions(1);
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({
					flow: true,
				}),
			});
			expect(table.getTagsWithProperty("phrasing")).toEqual([]);
		});
	});

	describe("getTagsDerivedFrom()", () => {
		it("should return list of all tags derived from given tagname", () => {
			expect.assertions(2);
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({}),
				bar: mockEntry({
					inherit: "foo",
				}),
			});
			expect(table.getTagsDerivedFrom("foo")).toEqual(["foo", "bar"]);
			expect(table.getTagsDerivedFrom("bar")).toEqual(["bar"]);
		});

		it("should return empty list if nothing matches", () => {
			expect.assertions(1);
			const table = new MetaTable();
			expect(table.getTagsDerivedFrom("missing")).toEqual([]);
		});
	});

	describe("extendValidationSchema()", () => {
		it("should add element properties", () => {
			expect.assertions(1);
			const table = new MetaTable();
			table.extendValidationSchema({
				properties: {
					foo: {
						type: "boolean",
					},
				},
			});
			const schema = table.getJSONSchema();
			const properties = schema.patternProperties["^[^$].*$"].properties;
			expect(properties).toEqual(
				expect.objectContaining({
					foo: {
						type: "boolean",
					},
				}),
			);
		});

		it("should add definitions", () => {
			expect.assertions(1);
			const table = new MetaTable();
			table.extendValidationSchema({
				definitions: {
					foo: {
						type: "boolean",
					},
				},
			});
			const schema = table.getJSONSchema();
			const definitions = schema.definitions;
			expect(definitions).toEqual(
				expect.objectContaining({
					foo: {
						type: "boolean",
					},
				}),
			);
		});
	});
});

function mockEntry(stub: Partial<MetaData> = {}): MetaData {
	return {
		metadata: false,
		flow: false,
		foreign: false,
		sectioning: false,
		heading: false,
		phrasing: false,
		embedded: false,
		interactive: false,
		deprecated: false,
		void: false,
		transparent: false,
		scriptSupporting: false,
		form: false,
		...stub,
	};
}
