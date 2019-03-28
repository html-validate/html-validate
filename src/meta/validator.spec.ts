import { Config } from "../config";
import { Attribute, DynamicValue, HtmlElement } from "../dom";
import { Parser } from "../parser";
import { MetaData, MetaTable, Validator } from "./";

class ConfigMock extends Config {
	constructor(metaTable: MetaTable) {
		super();
		this.metaTable = metaTable;
	}
}

describe("Meta validator", () => {
	describe("validatePermitted()", () => {
		it("should handle undefined", () => {
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			expect(Validator.validatePermitted(foo, undefined)).toBeTruthy();
		});

		it("should validate tagName", () => {
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ void: true }),
				nil: mockEntry({ void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo, nil] = parser.parseHtml("<foo/><nil/>").root.childElements;
			const rules = ["foo"];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate tagName with qualifier", () => {
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ void: true }),
				nil: mockEntry({ void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo, nil] = parser.parseHtml("<foo/><nil/>").root.childElements;
			const rules = ["foo?"];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @meta", () => {
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry({ void: true }),
				meta: mockEntry({ metadata: true, void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [meta, nil] = parser.parseHtml("<meta/><nil/>").root.childElements;
			const rules = ["@meta"];
			expect(Validator.validatePermitted(meta, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @flow", () => {
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry({ void: true }),
				flow: mockEntry({ flow: true, void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [flow, nil] = parser.parseHtml("<flow/><nil/>").root.childElements;
			const rules = ["@flow"];
			expect(Validator.validatePermitted(flow, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @sectioning", () => {
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry({ void: true }),
				sectioning: mockEntry({ sectioning: true, void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [sectioning, nil] = parser.parseHtml(
				"<sectioning/><nil/>"
			).root.childElements;
			const rules = ["@sectioning"];
			expect(Validator.validatePermitted(sectioning, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @heading", () => {
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry({ void: true }),
				heading: mockEntry({ heading: true, void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [heading, nil] = parser.parseHtml(
				"<heading/><nil/>"
			).root.childElements;
			const rules = ["@heading"];
			expect(Validator.validatePermitted(heading, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @phrasing", () => {
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry({ void: true }),
				phrasing: mockEntry({ phrasing: true, void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [phrasing, nil] = parser.parseHtml(
				"<phrasing/><nil/>"
			).root.childElements;
			const rules = ["@phrasing"];
			expect(Validator.validatePermitted(phrasing, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @embedded", () => {
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry({ void: true }),
				embedded: mockEntry({ embedded: true, void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [embedded, nil] = parser.parseHtml(
				"<embedded/><nil/>"
			).root.childElements;
			const rules = ["@embedded"];
			expect(Validator.validatePermitted(embedded, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @interactive", () => {
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry({ void: true }),
				interactive: mockEntry({
					interactive: true,
					void: true,
				}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [interactive, nil] = parser.parseHtml(
				"<interactive/><nil/>"
			).root.childElements;
			const rules = ["@interactive"];
			expect(Validator.validatePermitted(interactive, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate multiple rules (OR)", () => {
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry({ void: true }),
				flow: mockEntry({ flow: true, void: true }),
				phrasing: mockEntry({ phrasing: true, void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [flow, phrasing, nil] = parser.parseHtml(
				"<flow/><phrasing/><nil/>"
			).root.childElements;
			const rules = ["@flow", "@phrasing"];
			expect(Validator.validatePermitted(flow, rules)).toBeTruthy();
			expect(Validator.validatePermitted(phrasing, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate multiple rules (AND)", () => {
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ flow: true, phrasing: true, void: true }),
				flow: mockEntry({ flow: true, phrasing: false, void: true }),
				phrasing: mockEntry({
					flow: false,
					phrasing: true,
					void: true,
				}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo, flow, phrasing] = parser.parseHtml(
				"<foo/><flow/><phrasing/>"
			).root.childElements;
			const rules = [["@flow", "@phrasing"]];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(flow, rules)).toBeFalsy();
			expect(Validator.validatePermitted(phrasing, rules)).toBeFalsy();
		});

		it("should support excluding tagname", () => {
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ flow: true, void: true }),
				bar: mockEntry({ flow: true, void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo, bar] = parser.parseHtml(
				"<foo/><bar/><nil/>"
			).root.childElements;
			const rules = [
				[
					"@flow",
					{
						exclude: "bar",
					},
				],
			];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(bar, rules)).toBeFalsy();
		});

		it("should support excluding category", () => {
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ flow: true, interactive: false, void: true }),
				bar: mockEntry({ flow: true, interactive: true, void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo, bar] = parser.parseHtml(
				"<foo/><bar/><nil/>"
			).root.childElements;
			const rules = [
				[
					"@flow",
					{
						exclude: "@interactive",
					},
				],
			];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(bar, rules)).toBeFalsy();
		});

		it("should support excluding multiple targets", () => {
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ flow: true, interactive: false, void: true }),
				bar: mockEntry({ flow: true, interactive: true, void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo, bar] = parser.parseHtml(
				"<foo/><bar/><nil/>"
			).root.childElements;
			const rules = [{ exclude: ["bar", "baz"] }];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(bar, rules)).toBeFalsy();
		});

		it("should support excluding multiple targets together", () => {
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ flow: true, interactive: false, void: true }),
				bar: mockEntry({ flow: true, interactive: true, void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo, bar] = parser.parseHtml(
				"<foo/><bar/><nil/>"
			).root.childElements;
			const rules = [
				[
					"@flow",
					{
						exclude: ["bar", "baz"],
					},
				],
			];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(bar, rules)).toBeFalsy();
		});

		it("should handle empty object", () => {
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ flow: true, void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			const rules = [["@flow", {}]];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
		});

		it("should throw error on invalid category", () => {
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ flow: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			const rules = ["@invalid"];
			expect(() => {
				Validator.validatePermitted(foo, rules);
			}).toThrow('Invalid content category "@invalid"');
		});

		it("should throw error on invalid permitted rule", () => {
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ flow: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			const rules = [
				[
					"@flow",
					{
						spam: "ham",
					},
				],
			];
			expect(() => {
				Validator.validatePermitted(foo, rules);
			}).toThrow(
				'Permitted rule "{"spam":"ham"}" contains unknown property "spam"'
			);
		});
	});

	describe("validateOccurrences()", () => {
		it("should handle undefined", () => {
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			expect(Validator.validateOccurrences(foo, undefined, 1)).toBeTruthy();
		});

		it("should support missing qualifier", () => {
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			const rules = ["foo"];
			expect(Validator.validateOccurrences(foo, rules, 0)).toBeTruthy();
			expect(Validator.validateOccurrences(foo, rules, 9)).toBeTruthy();
		});

		it("should support ? qualifier", () => {
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			const rules = ["foo?"];
			expect(Validator.validateOccurrences(foo, rules, 0)).toBeTruthy();
			expect(Validator.validateOccurrences(foo, rules, 1)).toBeTruthy();
			expect(Validator.validateOccurrences(foo, rules, 2)).toBeFalsy();
		});

		it("should support * qualifier", () => {
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			const rules = ["foo*"];
			expect(Validator.validateOccurrences(foo, rules, 0)).toBeTruthy();
			expect(Validator.validateOccurrences(foo, rules, 9)).toBeTruthy();
		});
	});

	describe("validateOrder()", () => {
		let table: MetaTable;
		let parser: Parser;
		let cb: (node: HtmlElement, prev: HtmlElement) => void;

		beforeEach(() => {
			table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ void: true }),
				bar: mockEntry({ void: true, flow: true }),
			});
			parser = new Parser(new ConfigMock(table));
			cb = jest.fn();
		});

		it("should handle undefined rules", () => {
			const children = parser.parseHtml("<foo/>").root.childElements;
			expect(Validator.validateOrder(children, undefined, cb)).toBeTruthy();
			expect(cb).not.toHaveBeenCalled();
		});

		it("should return error when elements are out of order", () => {
			const children = parser.parseHtml("<bar/><foo/>").root.childElements;
			const rules = ["foo", "bar"];
			expect(Validator.validateOrder(children, rules, cb)).toBeFalsy();
			expect(cb).toHaveBeenCalledWith(children[1], children[0]);
		});

		it("should not return error when elements are in order", () => {
			const children = parser.parseHtml("<foo/><bar/>").root.childElements;
			const rules = ["foo", "bar"];
			expect(Validator.validateOrder(children, rules, cb)).toBeTruthy();
			expect(cb).not.toHaveBeenCalled();
		});

		it("should handle elements with unspecified order", () => {
			const children = parser.parseHtml("<foo/><bar/><foo/>").root
				.childElements;
			const rules = ["foo"];
			expect(Validator.validateOrder(children, rules, cb)).toBeTruthy();
			expect(cb).not.toHaveBeenCalled();
		});

		it("should handle categories", () => {
			const children1 = parser.parseHtml("<foo/><bar/>").root.childElements;
			const children2 = parser.parseHtml("<bar/><foo/>").root.childElements;
			const rules = ["foo", "@flow"];
			expect(Validator.validateOrder(children1, rules, cb)).toBeTruthy();
			expect(Validator.validateOrder(children2, rules, cb)).toBeFalsy();
		});
	});

	describe("validateAttribute()", () => {
		it("should match if no rule is present", () => {
			const rules = {};
			expect(
				Validator.validateAttribute(new Attribute("foo", "bar"), rules)
			).toBeTruthy();
		});

		it("should match regexp", () => {
			const rules = {
				foo: [/ba.*/],
			};
			expect(
				Validator.validateAttribute(new Attribute("foo", "bar"), rules)
			).toBeTruthy();
			expect(
				Validator.validateAttribute(new Attribute("foo", "car"), rules)
			).toBeFalsy();
			expect(
				Validator.validateAttribute(new Attribute("foo", null), rules)
			).toBeFalsy();
		});

		it("should match string value", () => {
			const rules = {
				foo: ["bar"],
			};
			expect(
				Validator.validateAttribute(new Attribute("foo", "bar"), rules)
			).toBeTruthy();
			expect(
				Validator.validateAttribute(new Attribute("foo", "car"), rules)
			).toBeFalsy();
		});

		it("should match dynamic value", () => {
			const rules = {
				foo: ["bar"],
				bar: [] as string[],
			};
			const dynamic = new DynamicValue("any");
			expect(
				Validator.validateAttribute(new Attribute("foo", dynamic), rules)
			).toBeTruthy();
			expect(
				Validator.validateAttribute(new Attribute("bar", dynamic), rules)
			).toBeTruthy();
		});

		it("should match if one of multiple allowed matches", () => {
			const rules = {
				foo: ["fred", "barney", "wilma"],
			};
			expect(
				Validator.validateAttribute(new Attribute("foo", "barney"), rules)
			).toBeTruthy();
			expect(
				Validator.validateAttribute(new Attribute("foo", "pebble"), rules)
			).toBeFalsy();
		});

		it("should consider empty list as boolean attribute", () => {
			const rules = {
				foo: [] as string[],
			};
			expect(
				Validator.validateAttribute(new Attribute("foo", null), rules)
			).toBeTruthy();
		});

		it("should normalize boolean attributes", () => {
			const rules = {
				foo: [] as string[],
			};
			expect(
				Validator.validateAttribute(new Attribute("foo", null), rules)
			).toBeTruthy();
			expect(
				Validator.validateAttribute(new Attribute("foo", ""), rules)
			).toBeTruthy();
			expect(
				Validator.validateAttribute(new Attribute("foo", "foo"), rules)
			).toBeTruthy();
			expect(
				Validator.validateAttribute(new Attribute("foo", "bar"), rules)
			).toBeFalsy();
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
		},
		stub
	);
}
