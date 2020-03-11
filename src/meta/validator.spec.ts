import { Config } from "../config";
import { Attribute, DynamicValue, HtmlElement } from "../dom";
import { Parser } from "../parser";
import { PermittedAttribute } from "./element";
import { MetaData, MetaTable, Validator } from ".";

class ConfigMock extends Config {
	public constructor(metaTable: MetaTable) {
		super();
		this.metaTable = metaTable;
	}
}

describe("Meta validator", () => {
	describe("validatePermitted()", () => {
		it("should handle undefined", () => {
			expect.assertions(1);
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			expect(Validator.validatePermitted(foo, undefined)).toBeTruthy();
		});

		it("should validate tagName", () => {
			expect.assertions(2);
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
			expect.assertions(2);
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
			expect.assertions(2);
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
			expect.assertions(2);
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
			expect.assertions(2);
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
			expect.assertions(2);
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
			expect.assertions(2);
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
			expect.assertions(2);
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
			expect.assertions(2);
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

		it("should validate @script", () => {
			expect.assertions(2);
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry({ void: true }),
				scripting: mockEntry({
					scriptSupporting: true,
					void: true,
				}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [script, nil] = parser.parseHtml(
				"<scripting/><nil/>"
			).root.childElements;
			const rules = ["@script"];
			expect(Validator.validatePermitted(script, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @form", () => {
			expect.assertions(2);
			const table = new MetaTable();
			table.loadFromObject({
				nil: mockEntry({ void: true }),
				form: mockEntry({
					form: true,
					void: true,
				}),
			});
			const parser = new Parser(new ConfigMock(table));
			const [form, nil] = parser.parseHtml("<form/><nil/>").root.childElements;
			const rules = ["@form"];
			expect(Validator.validatePermitted(form, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate multiple rules (OR)", () => {
			expect.assertions(3);
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
			expect.assertions(3);
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
			expect.assertions(2);
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
			expect.assertions(2);
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
			expect.assertions(2);
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
			expect.assertions(2);
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
			expect.assertions(1);
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
			expect.assertions(1);
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
			expect.assertions(1);
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
			expect.assertions(1);
			const table = new MetaTable();
			table.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const parser = new Parser(new ConfigMock(table));
			const [foo] = parser.parseHtml("<foo/>").root.childElements;
			expect(Validator.validateOccurrences(foo, undefined, 1)).toBeTruthy();
		});

		it("should support missing qualifier", () => {
			expect.assertions(2);
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
			expect.assertions(3);
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
			expect.assertions(2);
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
			expect.assertions(2);
			const children = parser.parseHtml("<foo/>").root.childElements;
			expect(Validator.validateOrder(children, undefined, cb)).toBeTruthy();
			expect(cb).not.toHaveBeenCalled();
		});

		it("should return error when elements are out of order", () => {
			expect.assertions(2);
			const children = parser.parseHtml("<bar/><foo/>").root.childElements;
			const rules = ["foo", "bar"];
			expect(Validator.validateOrder(children, rules, cb)).toBeFalsy();
			expect(cb).toHaveBeenCalledWith(children[1], children[0]);
		});

		it("should not return error when elements are in order", () => {
			expect.assertions(2);
			const children = parser.parseHtml("<foo/><bar/>").root.childElements;
			const rules = ["foo", "bar"];
			expect(Validator.validateOrder(children, rules, cb)).toBeTruthy();
			expect(cb).not.toHaveBeenCalled();
		});

		it("should handle elements with unspecified order", () => {
			expect.assertions(2);
			const children = parser.parseHtml("<foo/><bar/><foo/>").root
				.childElements;
			const rules = ["foo"];
			expect(Validator.validateOrder(children, rules, cb)).toBeTruthy();
			expect(cb).not.toHaveBeenCalled();
		});

		it("should handle categories", () => {
			expect.assertions(2);
			const children1 = parser.parseHtml("<foo/><bar/>").root.childElements;
			const children2 = parser.parseHtml("<bar/><foo/>").root.childElements;
			const rules = ["foo", "@flow"];
			expect(Validator.validateOrder(children1, rules, cb)).toBeTruthy();
			expect(Validator.validateOrder(children2, rules, cb)).toBeFalsy();
		});
	});

	describe("validateAncestors()", () => {
		let root: HtmlElement;

		beforeAll(() => {
			const parser = new Parser(Config.empty());
			root = parser.parseHtml(`
				<dl id="variant-1">
					<dt></dt>
					<dd></dd>
				</dl>`).root;
		});

		it("should match if no rule is present", () => {
			expect.assertions(2);
			const node = root.querySelector("dd");
			expect(Validator.validateAncestors(node, undefined)).toBeTruthy();
			expect(Validator.validateAncestors(node, [])).toBeTruthy();
		});

		it("should match ancestors", () => {
			expect.assertions(1);
			const rules: string[] = ["dl"];
			const node = root.querySelector("dd");
			expect(Validator.validateAncestors(node, rules)).toBeTruthy();
		});

		it("should match itself", () => {
			expect.assertions(1);
			const rules: string[] = ["dl > dd"];
			const node = root.querySelector("dd");
			expect(Validator.validateAncestors(node, rules)).toBeTruthy();
		});

		it("should match if one rule matches", () => {
			expect.assertions(1);
			const rules: string[] = ["spam", "dl"];
			const node = root.querySelector("dd");
			expect(Validator.validateAncestors(node, rules)).toBeTruthy();
		});

		it("should return false if no rule matches", () => {
			expect.assertions(1);
			const rules: string[] = ["spam"];
			const node = root.querySelector("dd");
			expect(Validator.validateAncestors(node, rules)).toBeFalsy();
		});
	});

	describe("validateRequiredContent()", () => {
		let parser: Parser;

		beforeAll(() => {
			parser = new Parser(Config.empty());
		});

		it("should match if no rule is present", () => {
			expect.assertions(2);
			const node = parser.parseHtml("<div></div>").querySelector("div");
			expect(Validator.validateRequiredContent(node, undefined)).toEqual([]);
			expect(Validator.validateRequiredContent(node, [])).toEqual([]);
		});

		it("should return missing content", () => {
			expect.assertions(1);
			const node = parser
				.parseHtml("<div><foo></foo></div>")
				.querySelector("div");
			expect(
				Validator.validateRequiredContent(node, ["foo", "bar", "baz"])
			).toEqual(["bar", "baz"]);
		});
	});

	describe("validateAttribute()", () => {
		function validateAttribute(
			key: string,
			value: null | string | DynamicValue,
			rules: PermittedAttribute
		): boolean {
			return Validator.validateAttribute(new Attribute(key, value), rules);
		}

		it("should match if no rule is present", () => {
			expect.assertions(1);
			const rules: PermittedAttribute = {};
			expect(validateAttribute("foo", "bar", rules)).toBeTruthy();
		});

		it.each`
			regex     | value
			${/ba.*/} | ${"bar"}
			${/.*/}   | ${"foo"}
			${/.*/}   | ${""}
		`("should match regexp $regex vs $value", ({ regex, value }) => {
			expect.assertions(1);
			const rules: PermittedAttribute = { foo: { enum: [regex] } };
			expect(validateAttribute("foo", value, rules)).toBeTruthy();
		});

		it.each`
			regex     | value    | expected
			${/ba.*/} | ${"car"} | ${false}
			${/ba.*/} | ${null}  | ${false}
			${/.*/}   | ${null}  | ${false}
		`("should not match regexp $regex vs $value", ({ regex, value }) => {
			expect.assertions(1);
			const rules: PermittedAttribute = { foo: { enum: [regex] } };
			expect(validateAttribute("foo", value, rules)).toBeFalsy();
		});

		it("should match string value", () => {
			expect.assertions(2);
			const rules: PermittedAttribute = {
				foo: { enum: ["bar"] },
			};
			expect(validateAttribute("foo", "bar", rules)).toBeTruthy();
			expect(validateAttribute("foo", "car", rules)).toBeFalsy();
		});

		it("should match dynamic value", () => {
			expect.assertions(2);
			const rules: PermittedAttribute = {
				foo: { enum: ["bar"] },
				bar: { boolean: true },
			};
			const dynamic = new DynamicValue("any");
			expect(validateAttribute("foo", dynamic, rules)).toBeTruthy();
			expect(validateAttribute("bar", dynamic, rules)).toBeTruthy();
		});

		it("should match if one of multiple allowed matches", () => {
			expect.assertions(2);
			const rules: PermittedAttribute = {
				foo: { enum: ["fred", "barney", "wilma"] },
			};
			expect(validateAttribute("foo", "barney", rules)).toBeTruthy();
			expect(validateAttribute("foo", "pebble", rules)).toBeFalsy();
		});

		it("should handle empty enumeration", () => {
			expect.assertions(3);
			const rules: PermittedAttribute = {
				foo: { enum: [] },
			};
			expect(validateAttribute("foo", null, rules)).toBeFalsy();
			expect(validateAttribute("foo", "", rules)).toBeFalsy();
			expect(validateAttribute("foo", "foo", rules)).toBeFalsy();
		});

		it("should handle null", () => {
			expect.assertions(1);
			const rules: PermittedAttribute = {
				foo: { enum: ["foo", "/bar/"] },
			};
			expect(validateAttribute("foo", null, rules)).toBeFalsy();
		});

		it("should consider boolean property as boolean attribute", () => {
			expect.assertions(3);
			const rules: PermittedAttribute = {
				foo: { boolean: true },
			};
			expect(validateAttribute("foo", null, rules)).toBeTruthy();
			expect(validateAttribute("foo", "", rules)).toBeTruthy();
			expect(validateAttribute("foo", "foo", rules)).toBeTruthy();
		});

		it("should consider omit property as either null or empty string", () => {
			expect.assertions(3);
			const rules: PermittedAttribute = {
				foo: { omit: true },
			};
			expect(validateAttribute("foo", null, rules)).toBeTruthy();
			expect(validateAttribute("foo", "", rules)).toBeTruthy();
			expect(validateAttribute("foo", "foo", rules)).toBeFalsy();
		});

		it("should consider empty string as empty string", () => {
			expect.assertions(3);
			const rules: PermittedAttribute = {
				foo: { enum: [""] },
			};
			expect(validateAttribute("foo", null, rules)).toBeFalsy();
			expect(validateAttribute("foo", "", rules)).toBeTruthy();
			expect(validateAttribute("foo", "foo", rules)).toBeFalsy();
		});

		describe("should handle omit and enum combined", () => {
			it.each`
				omit     | enum    | value   | expected
				${false} | ${[]}   | ${null} | ${false}
				${false} | ${[]}   | ${""}   | ${false}
				${false} | ${[""]} | ${null} | ${false}
				${false} | ${[""]} | ${""}   | ${true}
				${true}  | ${[]}   | ${null} | ${true}
				${true}  | ${[]}   | ${""}   | ${true}
				${true}  | ${[""]} | ${null} | ${true}
				${true}  | ${[""]} | ${""}   | ${true}
			`("omit: $omit enum: $enum value: ${$value}", options => {
				const { expected, value } = options;
				expect.assertions(1);
				const rules: PermittedAttribute = {
					foo: options,
				};
				expect(validateAttribute("foo", value, rules)).toEqual(expected);
			});
		});

		it("should normalize boolean attributes", () => {
			expect.assertions(4);
			const rules: PermittedAttribute = {
				foo: { boolean: true },
			};
			expect(validateAttribute("foo", null, rules)).toBeTruthy();
			expect(validateAttribute("foo", "", rules)).toBeTruthy();
			expect(validateAttribute("foo", "foo", rules)).toBeTruthy();
			expect(validateAttribute("foo", "bar", rules)).toBeFalsy();
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
