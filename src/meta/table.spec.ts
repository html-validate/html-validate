import path from "path";

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
	{ virtual: true }
);

import { Config } from "../config";
import { UserError, SchemaValidationError } from "../error";
import { Parser } from "../parser";
import { MetaDataTable } from "./element";
import { MetaData, MetaTable } from ".";

class ConfigMock extends Config {
	public constructor(metaTable: MetaTable) {
		super();
		this.metaTable = metaTable;
	}
}

describe("MetaTable", () => {
	beforeEach(() => {
		validate.errors = [];
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
				foo: mockEntry({ invalid: true }),
			});
		expect(fn).toThrow(SchemaValidationError);
		expect(fn).toThrow(
			"Element metadata is not valid: /foo Property invalid is not expected to be here"
		);
	});

	it("should throw SchemaValidationError if file does not validate", () => {
		expect.assertions(2);
		const filename = path.resolve(
			__dirname,
			"../../test-files/meta/invalid-schema.json"
		);
		const table = new MetaTable();
		validate.errors = [
			{
				keyword: "additionalProperties",
				dataPath: "/foo",
				schemaPath: "#/patternProperties/%5E.*%24/additionalProperties",
				params: { additionalProperty: "invalid" },
				message: "should NOT have additional properties",
			},
		];
		expect(() => table.loadFromFile(filename)).toThrow(SchemaValidationError);
		expect(() => table.loadFromFile(filename)).toThrow(
			"Element metadata is not valid: /foo Property invalid is not expected to be here"
		);
	});

	it("should throw UserError if file is not properly formatted json", () => {
		expect.assertions(2);
		const table = new MetaTable();
		expect(() => table.loadFromFile("invalid-file.json")).toThrow(UserError);
		expect(() => table.loadFromFile("invalid-file.json")).toThrow(
			'Failed to load element metadata from "invalid-file.json"'
		);
	});

	it("should ignore $schema property", () => {
		expect.assertions(2);
		const table = new MetaTable();
		table.loadFromObject(({
			$schema: "https://example.net/schema.json",
			foo: {
				flow: true,
			},
		} as unknown) as MetaDataTable);
		expect(table.getMetaFor("foo")).toBeDefined();
		expect(table.getMetaFor("$schema")).toBeNull();
	});

	describe("should load metadata from", () => {
		const fileDir = path.resolve(__dirname, "../../test-files/meta");

		it("json file", () => {
			expect.assertions(1);
			const table = new MetaTable();
			const filename = path.join(fileDir, "elements-json.json");
			table.loadFromFile(filename);
			expect(table.getMetaFor("foo")).toMatchInlineSnapshot(`
				Object {
				  "flow": true,
				  "tagName": "foo",
				}
			`);
		});

		it("js file", () => {
			expect.assertions(1);
			const table = new MetaTable();
			const filename = path.join(fileDir, "elements-js.js");
			table.loadFromFile(filename);
			expect(table.getMetaFor("foo")).toMatchInlineSnapshot(`
				Object {
				  "flow": true,
				  "tagName": "foo",
				}
			`);
		});

		it("js without extension", () => {
			expect.assertions(1);
			const table = new MetaTable();
			const filename = path.join(fileDir, "elements-js");
			table.loadFromFile(filename);
			expect(table.getMetaFor("foo")).toMatchInlineSnapshot(`
				Object {
				  "flow": true,
				  "tagName": "foo",
				}
			`);
		});
	});

	describe("getMetaFor", () => {
		let table: MetaTable;

		beforeEach(() => {
			table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ phrasing: true }),
			});
		});

		it("should be populated for known elements", () => {
			expect.assertions(2);
			const meta = table.getMetaFor("foo");
			expect(meta).not.toBeUndefined();
			expect(meta.tagName).toEqual("foo");
		});

		it("should be null for unknown elements", () => {
			expect.assertions(1);
			const meta = table.getMetaFor("bar");
			expect(meta).toBeNull();
		});

		it("should be case insensitive", () => {
			expect.assertions(2);
			const meta = table.getMetaFor("FOO");
			expect(meta).not.toBeUndefined();
			expect(meta.tagName).toEqual("foo");
		});
	});

	describe("expression", () => {
		let table: MetaTable;

		it("should throw exception when function is missing", () => {
			expect.assertions(1);
			table = new MetaTable();
			table.loadFromObject({
				invalid: mockEntry({ interactive: ["invalid"], void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			expect(() => parser.parseHtml("<invalid/>")).toThrow(
				'Failed to find function "invalid" when evaluating property expression'
			);
		});

		it("should handle strings", () => {
			expect.assertions(1);
			table = new MetaTable();
			table.loadFromObject({
				invalid: mockEntry({ interactive: "invalid", void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			expect(() => parser.parseHtml("<invalid/>")).toThrow(
				'Failed to find function "invalid" when evaluating property expression'
			);
		});

		describe("isDescendant", () => {
			beforeEach(() => {
				table = new MetaTable();
				table.loadFromObject({
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
			});

			it("should be true if child is a descendant of given tagName", () => {
				expect.assertions(1);
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml("<foo><ham><dynamic/></ham></foo>").root;
				const el = dom.getElementsByTagName("dynamic");
				expect(el[0].meta.interactive).toBeTruthy();
			});

			it("should be false if child is not a descendant of given tagName", () => {
				expect.assertions(1);
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml("<foo><spam><dynamic/></spam></foo>").root;
				const el = dom.getElementsByTagName("dynamic");
				expect(el[0].meta.interactive).toBeFalsy();
			});

			it("should throw exception when invalid argument is used", () => {
				expect.assertions(1);
				const parser = new Parser(new ConfigMock(table));
				expect(() => parser.parseHtml("<invalid/>")).toThrow(
					'Property expression "isDescendant" must take string argument when evaluating metadata for <invalid>'
				);
			});
		});

		describe("hasAttribute", () => {
			beforeEach(() => {
				table = new MetaTable();
				table.loadFromObject({
					dynamic: mockEntry({
						interactive: ["hasAttribute", "foo"],
						void: true,
					}),
					invalid: mockEntry({
						interactive: ["hasAttribute", []],
						void: true,
					}),
				});
			});

			it("should be true if element has given attribute", () => {
				expect.assertions(1);
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml("<dynamic foo/>").root;
				const el = dom.getElementsByTagName("dynamic");
				expect(el[0].meta.interactive).toBeTruthy();
			});

			it("should be false if element does not have given attribute", () => {
				expect.assertions(1);
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml("<dynamic bar/>").root;
				const el = dom.getElementsByTagName("dynamic");
				expect(el[0].meta.interactive).toBeFalsy();
			});

			it("should throw exception when invalid argument is used", () => {
				expect.assertions(1);
				const parser = new Parser(new ConfigMock(table));
				expect(() => parser.parseHtml("<invalid/>")).toThrow(
					'Property expression "hasAttribute" must take string argument when evaluating metadata for <invalid>'
				);
			});
		});

		describe("matchAttribute", () => {
			beforeEach(() => {
				table = new MetaTable();
				table.loadFromObject({
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
			});

			it('should be true when "=" is used to match existing value', () => {
				expect.assertions(1);
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<foo type="hidden"/>').root;
				const el = dom.getElementsByTagName("foo");
				expect(el[0].meta.interactive).toBeTruthy();
			});

			it('should be false when "=" is used to match other value', () => {
				expect.assertions(1);
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<foo type="other"/>').root;
				const el = dom.getElementsByTagName("foo");
				expect(el[0].meta.interactive).toBeFalsy();
			});

			it('should be false when "=" is used to match missing value', () => {
				expect.assertions(1);
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml("<foo/>").root;
				const el = dom.getElementsByTagName("foo");
				expect(el[0].meta.interactive).toBeFalsy();
			});

			it('should be false when "!=" is used to match existing value', () => {
				expect.assertions(1);
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<bar type="hidden"/>').root;
				const el = dom.getElementsByTagName("bar");
				expect(el[0].meta.interactive).toBeFalsy();
			});

			it('should be true when "!=" is used to match other value', () => {
				expect.assertions(1);
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<bar type="other"/>').root;
				const el = dom.getElementsByTagName("bar");
				expect(el[0].meta.interactive).toBeTruthy();
			});

			it('should be false when "!=" is used to match missing value', () => {
				expect.assertions(1);
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml("<bar/>").root;
				const el = dom.getElementsByTagName("bar");
				expect(el[0].meta.interactive).toBeTruthy();
			});

			it("should throw exception when invalid operator is used", () => {
				expect.assertions(1);
				const parser = new Parser(new ConfigMock(table));
				expect(() => parser.parseHtml("<invalid1/>")).toThrow(
					'Property expression "matchAttribute" has invalid operator "#" when evaluating metadata for <invalid1>'
				);
			});

			it("should throw exception when parameters is malformed", () => {
				expect.assertions(2);
				const parser = new Parser(new ConfigMock(table));
				expect(() => parser.parseHtml("<invalid2/>")).toThrow(
					'Property expression "matchAttribute" must take [key, op, value] array as argument when evaluating metadata for <invalid2>'
				);
				expect(() => parser.parseHtml("<invalid3/>")).toThrow(
					'Property expression "matchAttribute" must take [key, op, value] array as argument when evaluating metadata for <invalid3>'
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
						attr: ["/foo/"],
					},
				}),
			});
			const meta = table.getMetaFor("foo");
			expect(meta).not.toBeUndefined();
			expect(meta.attributes).toEqual({
				attr: [/foo/],
			});
		});

		it("should handle case-insensitive flag", () => {
			expect.assertions(2);
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({
					attributes: {
						attr: ["/foo/i"],
					},
				}),
			});
			const meta = table.getMetaFor("foo");
			expect(meta).not.toBeUndefined();
			expect(meta.attributes).toEqual({
				attr: [/foo/i],
			});
		});

		it("should retain literal regexp", () => {
			expect.assertions(2);
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({
					attributes: {
						attr: [/foo/],
					},
				}),
			});
			const meta = table.getMetaFor("foo");
			expect(meta).not.toBeUndefined();
			expect(meta.attributes).toEqual({
				attr: [/foo/],
			});
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
				})
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
				})
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
				})
			);
		});

		it("should merge objects", () => {
			expect.assertions(2);
			const table = new MetaTable();
			table.loadFromObject({
				foo: {
					attributes: {
						a: ["1"],
						b: ["1"],
						c: ["1"],
					},
				},
				bar: {
					inherit: "foo",
					attributes: {
						b: ["2"],
						c: null,
					},
				},
			});
			table.loadFromObject({
				foo: {
					attributes: {
						a: ["2"],
						b: null,
					},
				},
			});
			const foo = table.getMetaFor("foo");
			const bar = table.getMetaFor("bar");
			expect(foo).toMatchInlineSnapshot(`
				Object {
				  "attributes": Object {
				    "a": Array [
				      "2",
				    ],
				    "c": Array [
				      "1",
				    ],
				  },
				  "tagName": "foo",
				}
			`);
			expect(bar).toMatchInlineSnapshot(`
				Object {
				  "attributes": Object {
				    "a": Array [
				      "1",
				    ],
				    "b": Array [
				      "2",
				    ],
				  },
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
});

function mockEntry(stub = {}): MetaData {
	return Object.assign(
		{
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
		},
		stub
	);
}
