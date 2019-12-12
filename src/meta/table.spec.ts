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
import { UserError } from "../error/user-error";
import { Parser } from "../parser";
import { MetaData, MetaTable } from "./";

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

	it("should throw error if data does not validate", () => {
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
		expect(fn).toThrow(UserError);
		expect(fn).toThrow(
			"Element metadata is not valid: /foo Property invalid is not expected to be here"
		);
	});

	it("should throw user-error if file is not properly formatted json", () => {
		const table = new MetaTable();
		expect(() => table.loadFromFile("invalid-file.json")).toThrow(UserError);
		expect(() => table.loadFromFile("invalid-file.json")).toThrow(
			'Failed to load element metadata from "invalid-file.json"'
		);
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
			const meta = table.getMetaFor("foo");
			expect(meta).not.toBeUndefined();
			expect(meta.tagName).toEqual("foo");
		});

		it("should be null for unknown elements", () => {
			const meta = table.getMetaFor("bar");
			expect(meta).toBeNull();
		});

		it("should be case insensitive", () => {
			const meta = table.getMetaFor("FOO");
			expect(meta).not.toBeUndefined();
			expect(meta.tagName).toEqual("foo");
		});
	});

	describe("expression", () => {
		let table: MetaTable;

		it("should throw exception when function is missing", () => {
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
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml("<foo><ham><dynamic/></ham></foo>").root;
				const el = dom.getElementsByTagName("dynamic");
				expect(el[0].meta.interactive).toBeTruthy();
			});

			it("should be false if child is not a descendant of given tagName", () => {
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml("<foo><spam><dynamic/></spam></foo>").root;
				const el = dom.getElementsByTagName("dynamic");
				expect(el[0].meta.interactive).toBeFalsy();
			});

			it("should throw exception when invalid argument is used", () => {
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
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml("<dynamic foo/>").root;
				const el = dom.getElementsByTagName("dynamic");
				expect(el[0].meta.interactive).toBeTruthy();
			});

			it("should be false if element does not have given attribute", () => {
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml("<dynamic bar/>").root;
				const el = dom.getElementsByTagName("dynamic");
				expect(el[0].meta.interactive).toBeFalsy();
			});

			it("should throw exception when invalid argument is used", () => {
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
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<foo type="hidden"/>').root;
				const el = dom.getElementsByTagName("foo");
				expect(el[0].meta.interactive).toBeTruthy();
			});

			it('should be false when "=" is used to match other value', () => {
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<foo type="other"/>').root;
				const el = dom.getElementsByTagName("foo");
				expect(el[0].meta.interactive).toBeFalsy();
			});

			it('should be false when "=" is used to match missing value', () => {
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml("<foo/>").root;
				const el = dom.getElementsByTagName("foo");
				expect(el[0].meta.interactive).toBeFalsy();
			});

			it('should be false when "!=" is used to match existing value', () => {
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<bar type="hidden"/>').root;
				const el = dom.getElementsByTagName("bar");
				expect(el[0].meta.interactive).toBeFalsy();
			});

			it('should be true when "!=" is used to match other value', () => {
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml('<bar type="other"/>').root;
				const el = dom.getElementsByTagName("bar");
				expect(el[0].meta.interactive).toBeTruthy();
			});

			it('should be false when "!=" is used to match missing value', () => {
				const parser = new Parser(new ConfigMock(table));
				const dom = parser.parseHtml("<bar/>").root;
				const el = dom.getElementsByTagName("bar");
				expect(el[0].meta.interactive).toBeTruthy();
			});

			it("should throw exception when invalid operator is used", () => {
				const parser = new Parser(new ConfigMock(table));
				expect(() => parser.parseHtml("<invalid1/>")).toThrow(
					'Property expression "matchAttribute" has invalid operator "#" when evaluating metadata for <invalid1>'
				);
			});

			it("should throw exception when parameters is malformed", () => {
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

	it("should expand regexp", () => {
		const table = new MetaTable();
		table.loadFromObject({
			foo: mockEntry({
				attributes: {
					attr: ["foo", "/bar/", /baz/],
				},
			}),
		});
		const meta = table.getMetaFor("foo");
		expect(meta).not.toBeUndefined();
		expect(meta.attributes).toEqual({
			attr: ["foo", /bar/, /baz/],
		});
	});

	describe("inheritance", () => {
		it("should be supported", () => {
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

		it("should allow overriding", () => {
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

		it("should throw error when extending missing element", () => {
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
