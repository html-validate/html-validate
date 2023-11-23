import { Config, ResolvedConfig } from "../config";
import { Location } from "../context";
import { Attribute, DynamicValue, HtmlElement } from "../dom";
import { Parser } from "../parser";
import { MetaAttribute, PermittedEntry } from "./element";
import { MetaData, MetaTable, Validator } from ".";

const location: Location = {
	filename: "inline",
	line: 1,
	column: 1,
	offset: 0,
	size: 1,
};

describe("Meta validator", () => {
	let metaTable: MetaTable;
	let config: ResolvedConfig;
	let parser: Parser;

	beforeEach(() => {
		metaTable = new MetaTable();
		config = new ResolvedConfig(
			{
				metaTable,
				plugins: [],
				rules: new Map(),
				transformers: [],
			},
			{},
		);
		parser = new Parser(config);
	});

	describe("validatePermitted()", () => {
		it("should handle null", () => {
			expect.assertions(1);
			metaTable.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const [foo] = parser.parseHtml("<foo/>").childElements;
			expect(Validator.validatePermitted(foo, null)).toBeTruthy();
		});

		it("should validate tagName", () => {
			expect.assertions(2);
			metaTable.loadFromObject({
				foo: mockEntry({ void: true }),
				nil: mockEntry({ void: true }),
			});
			const [foo, nil] = parser.parseHtml("<foo/><nil/>").childElements;
			const rules = ["foo"];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate tagName with qualifier", () => {
			expect.assertions(2);
			metaTable.loadFromObject({
				foo: mockEntry({ void: true }),
				nil: mockEntry({ void: true }),
			});
			const [foo, nil] = parser.parseHtml("<foo/><nil/>").childElements;
			const rules = ["foo?"];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @meta", () => {
			expect.assertions(2);
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				meta: mockEntry({ metadata: true, void: true }),
			});
			const [meta, nil] = parser.parseHtml("<meta/><nil/>").childElements;
			const rules = ["@meta"];
			expect(Validator.validatePermitted(meta, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @flow", () => {
			expect.assertions(2);
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				flow: mockEntry({ flow: true, void: true }),
			});
			const [flow, nil] = parser.parseHtml("<flow/><nil/>").childElements;
			const rules = ["@flow"];
			expect(Validator.validatePermitted(flow, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @sectioning", () => {
			expect.assertions(2);
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				sectioning: mockEntry({ sectioning: true, void: true }),
			});
			const [sectioning, nil] = parser.parseHtml("<sectioning/><nil/>").childElements;
			const rules = ["@sectioning"];
			expect(Validator.validatePermitted(sectioning, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @heading", () => {
			expect.assertions(2);
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				heading: mockEntry({ heading: true, void: true }),
			});
			const [heading, nil] = parser.parseHtml("<heading/><nil/>").childElements;
			const rules = ["@heading"];
			expect(Validator.validatePermitted(heading, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @phrasing", () => {
			expect.assertions(2);
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				phrasing: mockEntry({ phrasing: true, void: true }),
			});
			const [phrasing, nil] = parser.parseHtml("<phrasing/><nil/>").childElements;
			const rules = ["@phrasing"];
			expect(Validator.validatePermitted(phrasing, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @embedded", () => {
			expect.assertions(2);
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				embedded: mockEntry({ embedded: true, void: true }),
			});
			const [embedded, nil] = parser.parseHtml("<embedded/><nil/>").childElements;
			const rules = ["@embedded"];
			expect(Validator.validatePermitted(embedded, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @interactive", () => {
			expect.assertions(2);
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				interactive: mockEntry({
					interactive: true,
					void: true,
				}),
			});
			const [interactive, nil] = parser.parseHtml("<interactive/><nil/>").childElements;
			const rules = ["@interactive"];
			expect(Validator.validatePermitted(interactive, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @script", () => {
			expect.assertions(2);
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				scripting: mockEntry({
					scriptSupporting: true,
					void: true,
				}),
			});
			const [script, nil] = parser.parseHtml("<scripting/><nil/>").childElements;
			const rules = ["@script"];
			expect(Validator.validatePermitted(script, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @form", () => {
			expect.assertions(2);
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				form: mockEntry({
					form: true,
					void: true,
				}),
			});
			const [form, nil] = parser.parseHtml("<form/><nil/>").childElements;
			const rules = ["@form"];
			expect(Validator.validatePermitted(form, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate @heading with qualifier", () => {
			expect.assertions(3);
			metaTable.loadFromObject({
				h1: mockEntry({ heading: true, void: true }),
				h2: mockEntry({ heading: true, void: true }),
				nil: mockEntry({ void: true }),
			});
			const [h1, nil, h2] = parser.parseHtml("<h1/><nil/><h2/>").childElements;
			const rules = ["@heading?"];
			expect(Validator.validatePermitted(h1, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
			expect(Validator.validatePermitted(h2, rules)).toBeTruthy();
		});

		it("should validate multiple rules (OR)", () => {
			expect.assertions(3);
			metaTable.loadFromObject({
				nil: mockEntry({ void: true }),
				flow: mockEntry({ flow: true, void: true }),
				phrasing: mockEntry({ phrasing: true, void: true }),
			});
			const [flow, phrasing, nil] = parser.parseHtml("<flow/><phrasing/><nil/>").childElements;
			const rules = ["@flow", "@phrasing"];
			expect(Validator.validatePermitted(flow, rules)).toBeTruthy();
			expect(Validator.validatePermitted(phrasing, rules)).toBeTruthy();
			expect(Validator.validatePermitted(nil, rules)).toBeFalsy();
		});

		it("should validate multiple rules (AND)", () => {
			expect.assertions(3);
			metaTable.loadFromObject({
				foo: mockEntry({ flow: true, phrasing: true, void: true }),
				flow: mockEntry({ flow: true, phrasing: false, void: true }),
				phrasing: mockEntry({
					flow: false,
					phrasing: true,
					void: true,
				}),
			});
			const [foo, flow, phrasing] = parser.parseHtml("<foo/><flow/><phrasing/>").childElements;
			const rules = [["@flow", "@phrasing"]];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(flow, rules)).toBeFalsy();
			expect(Validator.validatePermitted(phrasing, rules)).toBeFalsy();
		});

		it("should support excluding tagname", () => {
			expect.assertions(2);
			metaTable.loadFromObject({
				foo: mockEntry({ flow: true, void: true }),
				bar: mockEntry({ flow: true, void: true }),
			});
			const [foo, bar] = parser.parseHtml("<foo/><bar/><nil/>").childElements;
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
			metaTable.loadFromObject({
				foo: mockEntry({ flow: true, interactive: false, void: true }),
				bar: mockEntry({ flow: true, interactive: true, void: true }),
			});
			const [foo, bar] = parser.parseHtml("<foo/><bar/><nil/>").childElements;
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
			metaTable.loadFromObject({
				foo: mockEntry({ flow: true, interactive: false, void: true }),
				bar: mockEntry({ flow: true, interactive: true, void: true }),
			});
			const [foo, bar] = parser.parseHtml("<foo/><bar/><nil/>").childElements;
			const rules = [{ exclude: ["bar", "baz"] }];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
			expect(Validator.validatePermitted(bar, rules)).toBeFalsy();
		});

		it("should support excluding multiple targets together", () => {
			expect.assertions(2);
			metaTable.loadFromObject({
				foo: mockEntry({ flow: true, interactive: false, void: true }),
				bar: mockEntry({ flow: true, interactive: true, void: true }),
			});
			const [foo, bar] = parser.parseHtml("<foo/><bar/><nil/>").childElements;
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

		it("should default to pass when excluding category from element without meta", () => {
			expect.assertions(1);
			metaTable.loadFromObject({});
			const [foo] = parser.parseHtml("<foo/>").childElements;
			const rules = [
				[
					{
						exclude: "@interactive",
					},
				],
			];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
		});

		it("should handle empty object", () => {
			expect.assertions(1);
			metaTable.loadFromObject({
				foo: mockEntry({ flow: true, void: true }),
			});
			const [foo] = parser.parseHtml("<foo/>").childElements;
			const rules = [["@flow", {}]];
			expect(Validator.validatePermitted(foo, rules)).toBeTruthy();
		});

		it("should throw error on invalid category", () => {
			expect.assertions(1);
			metaTable.loadFromObject({
				foo: mockEntry({ flow: true }),
			});
			const [foo] = parser.parseHtml("<foo/>").childElements;
			const rules = ["@invalid"];
			expect(() => {
				Validator.validatePermitted(foo, rules);
			}).toThrow('Invalid content category "@invalid"');
		});

		it("should throw error on invalid permitted rule", () => {
			expect.assertions(1);
			metaTable.loadFromObject({
				foo: mockEntry({ flow: true }),
			});
			const [foo] = parser.parseHtml("<foo/>").childElements;
			const rules = [
				[
					"@flow",
					{
						spam: "ham",
					},
				] as PermittedEntry,
			];
			expect(() => {
				Validator.validatePermitted(foo, rules);
			}).toThrow('Permitted rule "{"spam":"ham"}" contains unknown property "spam"');
		});
	});

	describe("validateOccurrences()", () => {
		const cb = (_child: HtmlElement, _category: string): null => {
			return null;
		};

		it("should handle null", () => {
			expect.assertions(1);
			metaTable.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const foo = parser.parseHtml("<foo/>").childElements;
			expect(Validator.validateOccurrences(foo, null, cb)).toBeTruthy();
		});

		it("should support missing qualifier", () => {
			expect.assertions(2);
			metaTable.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const foo = parser.parseHtml("<foo/><foo/><foo/>").childElements;
			const rules = ["foo"];
			expect(Validator.validateOccurrences([], rules, cb)).toBeTruthy();
			expect(Validator.validateOccurrences(foo, rules, cb)).toBeTruthy();
		});

		it("should support ? qualifier", () => {
			expect.assertions(3);
			metaTable.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const rules = ["foo?"];
			expect(Validator.validateOccurrences([], rules, cb)).toBeTruthy();
			expect(
				Validator.validateOccurrences(parser.parseHtml("<foo/>").childElements, rules, cb),
			).toBeTruthy();
			expect(
				Validator.validateOccurrences(parser.parseHtml("<foo/><foo/>").childElements, rules, cb),
			).toBeFalsy();
		});

		it("should support * qualifier", () => {
			expect.assertions(2);
			metaTable.loadFromObject({
				foo: mockEntry({ void: true }),
			});
			const foo = parser.parseHtml("<foo/><foo/><foo/>").childElements;
			const rules = ["foo*"];
			expect(Validator.validateOccurrences([], rules, cb)).toBeTruthy();
			expect(Validator.validateOccurrences(foo, rules, cb)).toBeTruthy();
		});

		it("should support categories with qualifier", () => {
			expect.assertions(5);
			metaTable.loadFromObject({
				h1: mockEntry({ heading: true, void: true }),
				h2: mockEntry({ heading: true, void: true }),
			});
			const rules = ["@heading?"];
			expect(Validator.validateOccurrences([], rules, cb)).toBeTruthy();
			expect(
				Validator.validateOccurrences(parser.parseHtml("<h1/>").childElements, rules, cb),
			).toBeTruthy();
			expect(
				Validator.validateOccurrences(parser.parseHtml("<h2/>").childElements, rules, cb),
			).toBeTruthy();
			expect(
				Validator.validateOccurrences(parser.parseHtml("<h1/><h1/>").childElements, rules, cb),
			).toBeFalsy();
			expect(
				Validator.validateOccurrences(parser.parseHtml("<h1/><h2/>").childElements, rules, cb),
			).toBeFalsy();
		});
	});

	describe("validateOrder()", () => {
		let parser: Parser;
		let cb: (node: HtmlElement, prev: HtmlElement) => void;

		beforeEach(() => {
			metaTable.loadFromObject({
				foo: mockEntry({ void: true }),
				bar: mockEntry({ void: true, flow: true }),
			});
			parser = new Parser(config);
			cb = jest.fn();
		});

		it("should handle null rules", () => {
			expect.assertions(2);
			const children = parser.parseHtml("<foo/>").childElements;
			expect(Validator.validateOrder(children, null, cb)).toBeTruthy();
			expect(cb).not.toHaveBeenCalled();
		});

		it("should return error when elements are out of order", () => {
			expect.assertions(2);
			const children = parser.parseHtml("<bar/><foo/>").childElements;
			const rules = ["foo", "bar"];
			expect(Validator.validateOrder(children, rules, cb)).toBeFalsy();
			expect(cb).toHaveBeenCalledWith(children[1], children[0]);
		});

		it("should not return error when elements are in order", () => {
			expect.assertions(2);
			const children = parser.parseHtml("<foo/><bar/>").childElements;
			const rules = ["foo", "bar"];
			expect(Validator.validateOrder(children, rules, cb)).toBeTruthy();
			expect(cb).not.toHaveBeenCalled();
		});

		it("should handle elements with unspecified order", () => {
			expect.assertions(2);
			const children = parser.parseHtml("<foo/><bar/><foo/>").childElements;
			const rules = ["foo"];
			expect(Validator.validateOrder(children, rules, cb)).toBeTruthy();
			expect(cb).not.toHaveBeenCalled();
		});

		it("should handle categories", () => {
			expect.assertions(2);
			const children1 = parser.parseHtml("<foo/><bar/>").childElements;
			const children2 = parser.parseHtml("<bar/><foo/>").childElements;
			const rules = ["foo", "@flow"];
			expect(Validator.validateOrder(children1, rules, cb)).toBeTruthy();
			expect(Validator.validateOrder(children2, rules, cb)).toBeFalsy();
		});
	});

	describe("validateAncestors()", () => {
		let root: HtmlElement;

		beforeAll(() => {
			const parser = new Parser(Config.empty().resolve());
			root = parser.parseHtml(`
				<dl id="variant-1">
					<dt></dt>
					<dd></dd>
				</dl>`);
		});

		it("should match if no rule is present", () => {
			expect.assertions(2);
			const node = root.querySelector("dd")!;
			expect(Validator.validateAncestors(node, null)).toBeTruthy();
			expect(Validator.validateAncestors(node, [])).toBeTruthy();
		});

		it("should match ancestors", () => {
			expect.assertions(1);
			const rules: string[] = ["dl"];
			const node = root.querySelector("dd")!;
			expect(Validator.validateAncestors(node, rules)).toBeTruthy();
		});

		it("should match itself", () => {
			expect.assertions(1);
			const rules: string[] = ["dl > dd"];
			const node = root.querySelector("dd")!;
			expect(Validator.validateAncestors(node, rules)).toBeTruthy();
		});

		it("should match if one rule matches", () => {
			expect.assertions(1);
			const rules: string[] = ["spam", "dl"];
			const node = root.querySelector("dd")!;
			expect(Validator.validateAncestors(node, rules)).toBeTruthy();
		});

		it("should return false if no rule matches", () => {
			expect.assertions(1);
			const rules: string[] = ["spam"];
			const node = root.querySelector("dd")!;
			expect(Validator.validateAncestors(node, rules)).toBeFalsy();
		});
	});

	describe("validateRequiredContent()", () => {
		let parser: Parser;

		beforeAll(() => {
			parser = new Parser(Config.empty().resolve());
		});

		it("should match if no rule is present", () => {
			expect.assertions(2);
			const node = parser.parseHtml("<div></div>").querySelector("div")!;
			expect(Validator.validateRequiredContent(node, null)).toEqual([]);
			expect(Validator.validateRequiredContent(node, [])).toEqual([]);
		});

		it("should return missing content", () => {
			expect.assertions(1);
			const node = parser.parseHtml("<div><foo></foo></div>").querySelector("div")!;
			expect(Validator.validateRequiredContent(node, ["foo", "bar", "baz"])).toEqual([
				"bar",
				"baz",
			]);
		});
	});

	describe("validateAttribute()", () => {
		it("should match if no rule is present", () => {
			expect.assertions(1);
			const rules: Record<string, MetaAttribute> = {};
			const attr = new Attribute("foo", "bar", location, location);
			expect(Validator.validateAttribute(attr, rules)).toBeTruthy();
		});

		it.each`
			regex     | value
			${/ba.*/} | ${"bar"}
			${/.*/}   | ${"foo"}
			${/.*/}   | ${""}
		`("should match regexp $regex vs $value", ({ regex, value }) => {
			expect.assertions(1);
			const rules: Record<string, MetaAttribute> = { foo: { enum: [regex] } };
			const attr = new Attribute("foo", value, location, location);
			expect(Validator.validateAttribute(attr, rules)).toBeTruthy();
		});

		it.each`
			regex     | value    | expected
			${/ba.*/} | ${"car"} | ${false}
			${/ba.*/} | ${null}  | ${false}
			${/.*/}   | ${null}  | ${false}
		`("should not match regexp $regex vs $value", ({ regex, value }) => {
			expect.assertions(1);
			const rules: Record<string, MetaAttribute> = { foo: { enum: [regex] } };
			const attr = new Attribute("foo", value, location, location);
			expect(Validator.validateAttribute(attr, rules)).toBeFalsy();
		});

		it("should match string value", () => {
			expect.assertions(2);
			const rules: Record<string, MetaAttribute> = {
				foo: { enum: ["bar"] },
			};
			const bar = new Attribute("foo", "bar", location, location);
			const car = new Attribute("foo", "car", location, location);
			expect(Validator.validateAttribute(bar, rules)).toBeTruthy();
			expect(Validator.validateAttribute(car, rules)).toBeFalsy();
		});

		it("should match enum case-insensitive", () => {
			expect.assertions(2);
			const rules: Record<string, MetaAttribute> = {
				foo: { enum: ["bar"] },
			};
			const bar = new Attribute("foo", "bar", location, location);
			const car = new Attribute("foo", "BAR", location, location);
			expect(Validator.validateAttribute(bar, rules)).toBeTruthy();
			expect(Validator.validateAttribute(car, rules)).toBeTruthy();
		});

		it("should match dynamic value", () => {
			expect.assertions(2);
			const rules: Record<string, MetaAttribute> = {
				foo: { enum: ["bar"] },
				bar: { boolean: true },
			};
			const dynamic = new DynamicValue("any");
			const foo = new Attribute("foo", dynamic, location, location);
			const bar = new Attribute("bar", dynamic, location, location);
			expect(Validator.validateAttribute(foo, rules)).toBeTruthy();
			expect(Validator.validateAttribute(bar, rules)).toBeTruthy();
		});

		it("should match if one of multiple allowed matches", () => {
			expect.assertions(2);
			const rules: Record<string, MetaAttribute> = {
				foo: { enum: ["fred", "barney", "wilma"] },
			};
			const barney = new Attribute("foo", "barney", location, location);
			const pebble = new Attribute("foo", "pebble", location, location);
			expect(Validator.validateAttribute(barney, rules)).toBeTruthy();
			expect(Validator.validateAttribute(pebble, rules)).toBeFalsy();
		});

		it("should handle empty enumeration", () => {
			expect.assertions(3);
			const rules: Record<string, MetaAttribute> = {
				foo: { enum: [] },
			};
			const a = new Attribute("foo", "barney", location, location);
			const b = new Attribute("foo", "pebble", location, location);
			const c = new Attribute("foo", "barney", location, location);
			expect(Validator.validateAttribute(a, rules)).toBeFalsy();
			expect(Validator.validateAttribute(b, rules)).toBeFalsy();
			expect(Validator.validateAttribute(c, rules)).toBeFalsy();
		});

		it("should handle missing enumeration", () => {
			expect.assertions(3);
			const rules: Record<string, MetaAttribute> = {
				foo: {},
			};
			const omitted = new Attribute("foo", null, location, null);
			const empty = new Attribute("foo", "", location, null);
			const value = new Attribute("foo", "foo", location, location);
			expect(Validator.validateAttribute(omitted, rules)).toBeTruthy();
			expect(Validator.validateAttribute(empty, rules)).toBeTruthy();
			expect(Validator.validateAttribute(value, rules)).toBeTruthy();
		});

		it("should handle null", () => {
			expect.assertions(1);
			const rules: Record<string, MetaAttribute> = {
				foo: { enum: ["foo", "/bar/"] },
			};
			const attr = new Attribute("foo", null, location, null);
			expect(Validator.validateAttribute(attr, rules)).toBeFalsy();
		});

		it("should consider boolean property as boolean attribute", () => {
			expect.assertions(4);
			const rules: Record<string, MetaAttribute> = {
				foo: { boolean: true },
			};
			const omitted = new Attribute("foo", null, location, null);
			const empty = new Attribute("foo", "", location, null);
			const self = new Attribute("foo", "foo", location, location);
			const other = new Attribute("foo", "other", location, location);
			expect(Validator.validateAttribute(omitted, rules)).toBeTruthy();
			expect(Validator.validateAttribute(empty, rules)).toBeTruthy();
			expect(Validator.validateAttribute(self, rules)).toBeTruthy();
			expect(Validator.validateAttribute(other, rules)).toBeFalsy();
		});

		it("should consider omit property as either null or empty string", () => {
			expect.assertions(2);
			const rules: Record<string, MetaAttribute> = {
				foo: { omit: true },
			};
			const omitted = new Attribute("foo", null, location, null);
			const empty = new Attribute("foo", "", location, null);
			expect(Validator.validateAttribute(omitted, rules)).toBeTruthy();
			expect(Validator.validateAttribute(empty, rules)).toBeTruthy();
		});

		it("should consider empty string as empty string", () => {
			expect.assertions(3);
			const rules: Record<string, MetaAttribute> = {
				foo: { enum: [""] },
			};
			const omitted = new Attribute("foo", null, location, null);
			const empty = new Attribute("foo", "", location, null);
			const value = new Attribute("foo", "foo", location, location);
			expect(Validator.validateAttribute(omitted, rules)).toBeFalsy();
			expect(Validator.validateAttribute(empty, rules)).toBeTruthy();
			expect(Validator.validateAttribute(value, rules)).toBeFalsy();
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
			`("omit: $omit enum: $enum value: ${$value}", (options) => {
				expect.assertions(1);
				const { expected, value } = options;
				expect.assertions(1);
				const rules: Record<string, MetaAttribute> = {
					foo: options,
				};
				const attr = new Attribute("foo", value, location, location);
				expect(Validator.validateAttribute(attr, rules)).toEqual(expected);
			});
		});

		it("should normalize boolean attributes", () => {
			expect.assertions(4);
			const rules: Record<string, MetaAttribute> = {
				foo: { boolean: true },
			};
			const omitted = new Attribute("foo", null, location, null);
			const empty = new Attribute("foo", "", location, null);
			const self = new Attribute("foo", "foo", location, location);
			const other = new Attribute("foo", "bar", location, location);
			expect(Validator.validateAttribute(omitted, rules)).toBeTruthy();
			expect(Validator.validateAttribute(empty, rules)).toBeTruthy();
			expect(Validator.validateAttribute(self, rules)).toBeTruthy();
			expect(Validator.validateAttribute(other, rules)).toBeFalsy();
		});

		it.each`
			value           | expected
			${"foo"}        | ${true}
			${"bar"}        | ${true}
			${"baz"}        | ${false}
			${"foo bar"}    | ${true}
			${"foo baz"}    | ${false}
			${"foo    bar"} | ${true}
			${"foo    baz"} | ${false}
		`('should validate each token when using list: "$value"', ({ value, expected }) => {
			expect.assertions(1);
			const rules: Record<string, MetaAttribute> = {
				foo: { list: true, enum: ["foo", "bar"] },
			};
			const attr = new Attribute("foo", value, location, location);
			expect(Validator.validateAttribute(attr, rules)).toBe(expected);
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
