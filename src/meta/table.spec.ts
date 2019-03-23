import { Config } from "../config";
import { Parser } from "../parser";
import { MetaData, MetaTable } from "./";

class ConfigMock extends Config {
	constructor(metaTable: MetaTable) {
		super();
		this.metaTable = metaTable;
	}
}

describe("MetaTable", () => {
	it("should throw error when meta has unknown properties", () => {
		const table = new MetaTable();
		expect(() =>
			table.loadFromObject({
				foo: mockEntry({ invalid: true }),
			})
		).toThrowError('Metadata for <foo> contains unknown property "invalid"');
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
			expect(() => parser.parseHtml("<invalid/>")).toThrowError(
				'Failed to find function "invalid" when evaluating property expression'
			);
		});

		it("should handle strings", () => {
			table = new MetaTable();
			table.loadFromObject({
				invalid: mockEntry({ interactive: "invalid", void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			expect(() => parser.parseHtml("<invalid/>")).toThrowError(
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
				expect(() => parser.parseHtml("<invalid/>")).toThrowError(
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
				expect(() => parser.parseHtml("<invalid/>")).toThrowError(
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
				expect(() => parser.parseHtml("<invalid1/>")).toThrowError(
					'Property expression "matchAttribute" has invalid operator "#" when evaluating metadata for <invalid1>'
				);
			});

			it("should throw exception when parameters is malformed", () => {
				const parser = new Parser(new ConfigMock(table));
				expect(() => parser.parseHtml("<invalid2/>")).toThrowError(
					'Property expression "matchAttribute" must take [key, op, value] array as argument when evaluating metadata for <invalid2>'
				);
				expect(() => parser.parseHtml("<invalid3/>")).toThrowError(
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
			implicitClosed: [],
			attributes: {},
			deprecatedAttributes: [],
			requiredAttributes: [],
			permittedContent: [],
			permittedDescendants: [],
			permittedOrder: [],
		},
		stub
	);
}
