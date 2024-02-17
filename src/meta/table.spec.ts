/* eslint-disable import/no-dynamic-require, security/detect-non-literal-require, @typescript-eslint/no-var-requires -- needed to load fixtues */

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
import { MetaData, MetaDataTable } from "./element";
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
		const fn = (): void =>
			table.loadFromObject({
				foo: mockEntry({ invalid: true } as unknown as Partial<MetaData>),
			});
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
		expect(() => table.loadFromObject(data, filename)).toThrow(SchemaValidationError);
		expect(() => table.loadFromObject(data, filename)).toThrow(
			"Element metadata is not valid: /foo Property invalid is not expected to be here",
		);
	});

	it("should throw InheritError if inheritance could not be resolved", () => {
		expect.assertions(2);
		const filename = path.resolve(__dirname, "../../test-files/meta/invalid-inherit.json");
		const table = new MetaTable();
		const data = require(filename);
		expect(() => table.loadFromObject(data, filename)).toThrow(InheritError);
		expect(() => table.loadFromObject(data, filename)).toThrowErrorMatchingInlineSnapshot(
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
		expect(() => table.loadFromObject(data, "my-file.json")).toThrowErrorMatchingInlineSnapshot(
			`"Failed to load element metadata from "my-file.json""`,
		);
	});

	it("should throw original exception if no filename if provided", () => {
		expect.assertions(1);
		const table = new MetaTable();
		const data = { foo: {} };
		jest.spyOn(table as unknown as any, "addEntry").mockImplementation(() => {
			throw new Error("Mock error");
		});
		expect(() => table.loadFromObject(data)).toThrowErrorMatchingInlineSnapshot(`"Mock error"`);
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

	describe("expression", () => {
		let metaTable: MetaTable;
		let config: ResolvedConfig;

		it("should throw exception when function is missing", () => {
			expect.assertions(1);
			metaTable = new MetaTable();
			metaTable.loadFromObject({
				invalid: mockEntry({
					interactive: ["invalid"],
					void: true,
				} as unknown as Partial<MetaData>),
			});
			config = new ResolvedConfig(
				{
					metaTable,
					plugins: [],
					rules: new Map(),
					transformers: [],
				},
				{},
			);
			const parser = new Parser(config);
			expect(() => parser.parseHtml("<invalid/>")).toThrow(
				'Failed to find function "invalid" when evaluating property expression',
			);
		});

		it("should handle strings", () => {
			expect.assertions(1);
			metaTable = new MetaTable();
			metaTable.loadFromObject({
				invalid: mockEntry({ interactive: "invalid", void: true }),
			});
			config = new ResolvedConfig(
				{
					metaTable,
					plugins: [],
					rules: new Map(),
					transformers: [],
				},
				{},
			);
			const parser = new Parser(config);
			expect(() => parser.parseHtml("<invalid/>")).toThrow(
				'Failed to find function "invalid" when evaluating property expression',
			);
		});

		describe("isDescendant", () => {
			beforeEach(() => {
				metaTable = new MetaTable();
				metaTable.loadFromObject({
					foo: mockEntry(),
					spam: mockEntry(),
					ham: mockEntry(),
					dynamic: mockEntry({
						interactive: ["isDescendant", "ham"],
						void: true,
					}),
					invalid: mockEntry({
						interactive: ["isDescendant", []],
						void: true,
					}),
				});
				config = new ResolvedConfig(
					{
						metaTable,
						plugins: [],
						rules: new Map(),
						transformers: [],
					},
					{},
				);
			});

			it("should be true if child is a descendant of given tagName", () => {
				expect.assertions(1);
				const parser = new Parser(config);
				const dom = parser.parseHtml("<foo><ham><dynamic/></ham></foo>");
				const el = dom.getElementsByTagName("dynamic");
				expect(el[0].meta?.interactive).toBeTruthy();
			});

			it("should be false if child is not a descendant of given tagName", () => {
				expect.assertions(1);
				const parser = new Parser(config);
				const dom = parser.parseHtml("<foo><spam><dynamic/></spam></foo>");
				const el = dom.getElementsByTagName("dynamic");
				expect(el[0].meta?.interactive).toBeFalsy();
			});

			it("should throw exception when invalid argument is used", () => {
				expect.assertions(1);
				const parser = new Parser(config);
				expect(() => parser.parseHtml("<invalid/>")).toThrow(
					'Property expression "isDescendant" must take string argument when evaluating metadata for <invalid>',
				);
			});
		});

		describe("hasAttribute", () => {
			beforeEach(() => {
				metaTable = new MetaTable();
				metaTable.loadFromObject({
					dynamic: mockEntry({
						interactive: ["hasAttribute", "foo"],
						void: true,
					}),
					invalid: mockEntry({
						interactive: ["hasAttribute", []],
						void: true,
					}),
				});
				config = new ResolvedConfig(
					{
						metaTable,
						plugins: [],
						rules: new Map(),
						transformers: [],
					},
					{},
				);
			});

			it("should be true if element has given attribute", () => {
				expect.assertions(1);
				const parser = new Parser(config);
				const dom = parser.parseHtml("<dynamic foo/>");
				const el = dom.getElementsByTagName("dynamic");
				expect(el[0].meta?.interactive).toBeTruthy();
			});

			it("should be false if element does not have given attribute", () => {
				expect.assertions(1);
				const parser = new Parser(config);
				const dom = parser.parseHtml("<dynamic bar/>");
				const el = dom.getElementsByTagName("dynamic");
				expect(el[0].meta?.interactive).toBeFalsy();
			});

			it("should throw exception when invalid argument is used", () => {
				expect.assertions(1);
				const parser = new Parser(config);
				expect(() => parser.parseHtml("<invalid/>")).toThrow(
					'Property expression "hasAttribute" must take string argument when evaluating metadata for <invalid>',
				);
			});
		});

		describe("matchAttribute", () => {
			beforeEach(() => {
				metaTable = new MetaTable();
				metaTable.loadFromObject({
					foo: mockEntry({
						interactive: ["matchAttribute", ["type", "=", "hidden"]],
						void: true,
					}),
					bar: mockEntry({
						interactive: ["matchAttribute", ["type", "!=", "hidden"]],
						void: true,
					}),
					invalid1: mockEntry({
						interactive: ["matchAttribute", ["type", "#", "hidden"]],
						void: true,
					}),
					invalid2: mockEntry({
						interactive: ["matchAttribute", []],
						void: true,
					}),
					invalid3: mockEntry({
						interactive: ["matchAttribute", "foo"],
						void: true,
					}),
				});
				config = new ResolvedConfig(
					{
						metaTable,
						plugins: [],
						rules: new Map(),
						transformers: [],
					},
					{},
				);
			});

			it('should be true when "=" is used to match existing value', () => {
				expect.assertions(1);
				const parser = new Parser(config);
				const dom = parser.parseHtml('<foo type="hidden"/>');
				const el = dom.getElementsByTagName("foo");
				expect(el[0].meta?.interactive).toBeTruthy();
			});

			it('should be false when "=" is used to match other value', () => {
				expect.assertions(1);
				const parser = new Parser(config);
				const dom = parser.parseHtml('<foo type="other"/>');
				const el = dom.getElementsByTagName("foo");
				expect(el[0].meta?.interactive).toBeFalsy();
			});

			it('should be false when "=" is used to match missing value', () => {
				expect.assertions(1);
				const parser = new Parser(config);
				const dom = parser.parseHtml("<foo/>");
				const el = dom.getElementsByTagName("foo");
				expect(el[0].meta?.interactive).toBeFalsy();
			});

			it('should be false when "!=" is used to match existing value', () => {
				expect.assertions(1);
				const parser = new Parser(config);
				const dom = parser.parseHtml('<bar type="hidden"/>');
				const el = dom.getElementsByTagName("bar");
				expect(el[0].meta?.interactive).toBeFalsy();
			});

			it('should be true when "!=" is used to match other value', () => {
				expect.assertions(1);
				const parser = new Parser(config);
				const dom = parser.parseHtml('<bar type="other"/>');
				const el = dom.getElementsByTagName("bar");
				expect(el[0].meta?.interactive).toBeTruthy();
			});

			it('should be false when "!=" is used to match missing value', () => {
				expect.assertions(1);
				const parser = new Parser(config);
				const dom = parser.parseHtml("<bar/>");
				const el = dom.getElementsByTagName("bar");
				expect(el[0].meta?.interactive).toBeTruthy();
			});

			it("should throw exception when invalid operator is used", () => {
				expect.assertions(1);
				const parser = new Parser(config);
				expect(() => parser.parseHtml("<invalid1/>")).toThrow(
					'Property expression "matchAttribute" has invalid operator "#" when evaluating metadata for <invalid1>',
				);
			});

			it("should throw exception when parameters is malformed", () => {
				expect.assertions(2);
				const parser = new Parser(config);
				expect(() => parser.parseHtml("<invalid2/>")).toThrow(
					'Property expression "matchAttribute" must take [key, op, value] array as argument when evaluating metadata for <invalid2>',
				);
				expect(() => parser.parseHtml("<invalid3/>")).toThrow(
					'Property expression "matchAttribute" must take [key, op, value] array as argument when evaluating metadata for <invalid3>',
				);
			});
		});
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
				attr: { enum: [/^foo$/, /^bar$/, /^baz$/] },
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
			expect(() => table.init()).not.toThrow();
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
