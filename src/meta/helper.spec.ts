import { Config } from "../config";
import { type Source } from "../context";
import { type HtmlElement } from "../dom";
import { Parser } from "../parser";
import { processAttribute } from "../transform/mocks/attribute";
import {
	allowedIfAttributeHasValue,
	allowedIfAttributeIsAbsent,
	allowedIfAttributeIsPresent,
	allowedIfParentIsPresent,
} from "./helper";

const config = Config.empty();
const parser = new Parser(config.resolve());

function parse(markup: string, selector: string = "div"): HtmlElement {
	const source: Source = {
		data: markup,
		filename: "inline",
		line: 1,
		column: 1,
		offset: 0,
		hooks: {
			processAttribute,
		},
	};
	const doc = parser.parseHtml(source);
	const root = doc.querySelector(selector);
	if (!root) {
		throw new Error("Root element not found");
	}
	return root;
}

describe("allowedIfAttributeIsPresent()", () => {
	it("should not return error if given attribute is present", () => {
		expect.assertions(3);
		const markup = /* HTML */ ` <div foo bar baz></div> `;
		const root = parse(markup)._adapter;
		expect(allowedIfAttributeIsPresent("foo")(root)).toMatchInlineSnapshot(`null`);
		expect(allowedIfAttributeIsPresent("foo", "bar")(root)).toMatchInlineSnapshot(`null`);
		expect(allowedIfAttributeIsPresent("foo", "bar", "baz")(root)).toMatchInlineSnapshot(`null`);
	});

	it("should return error if given attribute is absent", () => {
		expect.assertions(3);
		const markup = /* HTML */ ` <div></div> `;
		const root = parse(markup)._adapter;
		expect(allowedIfAttributeIsPresent("foo")(root)).toMatchInlineSnapshot(
			`"requires "foo" attribute to be present"`,
		);
		expect(allowedIfAttributeIsPresent("foo", "bar")(root)).toMatchInlineSnapshot(
			`"requires "foo" or "bar" attribute to be present"`,
		);
		expect(allowedIfAttributeIsPresent("foo", "bar", "baz")(root)).toMatchInlineSnapshot(
			`"requires "foo", "bar" or "baz" attribute to be present"`,
		);
	});
});

describe("allowedIfAttributeIsAbsent()", () => {
	it("should return error if given attribute is present", () => {
		expect.assertions(3);
		const markup = /* HTML */ ` <div ham foo bar baz></div> `;
		const root = parse(markup)._adapter;
		const attr = root.getAttribute("ham")!;
		expect(allowedIfAttributeIsAbsent("foo")(root, attr)).toMatchInlineSnapshot(
			`"cannot be used at the same time as "foo""`,
		);
		expect(allowedIfAttributeIsAbsent("foo", "bar")(root, attr)).toMatchInlineSnapshot(
			`"cannot be used at the same time as "foo" or "bar""`,
		);
		expect(allowedIfAttributeIsAbsent("foo", "bar", "baz")(root, attr)).toMatchInlineSnapshot(
			`"cannot be used at the same time as "foo", "bar" or "baz""`,
		);
	});

	it("should not return error if given attribute is absent", () => {
		expect.assertions(3);
		const markup = /* HTML */ ` <div ham></div> `;
		const root = parse(markup)._adapter;
		const attr = root.getAttribute("ham")!;
		expect(allowedIfAttributeIsAbsent("foo")(root, attr)).toMatchInlineSnapshot(`null`);
		expect(allowedIfAttributeIsAbsent("foo", "bar")(root, attr)).toMatchInlineSnapshot(`null`);
		expect(allowedIfAttributeIsAbsent("foo", "bar", "baz")(root, attr)).toMatchInlineSnapshot(
			`null`,
		);
	});

	it("should filter output based on present attributes", () => {
		expect.assertions(2);
		const markup1 = /* HTML */ ` <div ham foo></div> `;
		const markup2 = /* HTML */ ` <div ham foo bar></div> `;
		const root1 = parse(markup1)._adapter;
		const root2 = parse(markup2)._adapter;
		const attr1 = root1.getAttribute("ham")!;
		const attr2 = root2.getAttribute("ham")!;
		const fn = allowedIfAttributeIsAbsent("foo", "bar", "baz");
		expect(fn(root1, attr1)).toMatchInlineSnapshot(`"cannot be used at the same time as "foo""`);
		expect(fn(root2, attr2)).toMatchInlineSnapshot(
			`"cannot be used at the same time as "foo" or "bar""`,
		);
	});
});

describe("allowedIfAttributeHasValue()", () => {
	it("should not return error if attribute has one of given values", () => {
		expect.assertions(3);
		const markup = /* HTML */ ` <div ham foo="bar"></div> `;
		const root = parse(markup)._adapter;
		const attr = root.getAttribute("ham")!;
		expect(allowedIfAttributeHasValue("foo", ["bar"])(root, attr)).toMatchInlineSnapshot(`null`);
		expect(allowedIfAttributeHasValue("foo", ["bar", "baz"])(root, attr)).toMatchInlineSnapshot(
			`null`,
		);
		expect(
			allowedIfAttributeHasValue("foo", ["bar", "baz", "ham"])(root, attr),
		).toMatchInlineSnapshot(`null`);
	});

	it("should not return error if attribute default value matches given value", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div ham></div> `;
		const root = parse(markup)._adapter;
		const attr = root.getAttribute("ham")!;
		const result = allowedIfAttributeHasValue("foo", ["bar"], { defaultValue: "bar" })(root, attr);
		expect(result).toMatchInlineSnapshot(`null`);
	});

	it("should not return error if attribute is dynamic", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div ham dynamic-foo="expr"></div> `;
		const root = parse(markup)._adapter;
		const attr = root.getAttribute("ham")!;
		const result = allowedIfAttributeHasValue("foo", ["bar"])(root, attr);
		expect(result).toMatchInlineSnapshot(`null`);
	});

	it("should return error if given attribute is absent", () => {
		expect.assertions(3);
		const markup = /* HTML */ ` <div ham></div> `;
		const root = parse(markup)._adapter;
		const attr = root.getAttribute("ham")!;
		expect(allowedIfAttributeHasValue("foo", ["bar"])(root, attr)).toMatchInlineSnapshot(
			`""foo" attribute must be "bar""`,
		);
		expect(allowedIfAttributeHasValue("foo", ["bar", "baz"])(root, attr)).toMatchInlineSnapshot(
			`""foo" attribute must be "bar" or "baz""`,
		);
		expect(
			allowedIfAttributeHasValue("foo", ["bar", "baz", "ham"])(root, attr),
		).toMatchInlineSnapshot(`""foo" attribute must be "bar", "baz" or "ham""`);
	});
});

describe("allowedIfParentIsPresent()", () => {
	it("should not return error if element has one of given parent elements", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<foo>
					<bar attr></bar>
				</foo>
				<div></div>
			</div>
		`;
		const root = parse(markup);
		const node = root.querySelector("bar")!._adapter;
		const attr = node.getAttribute("attr");
		expect(allowedIfParentIsPresent("foo")(node, attr)).toMatchInlineSnapshot(`null`);
	});

	it("should return error if element doesn't have one of given parents and elements", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<foo>
					<bar attr></bar>
				</foo>
			</div>
		`;
		const root = parse(markup);
		const node = root.querySelector("bar")!._adapter;
		const attr = node.getAttribute("attr");
		expect(allowedIfParentIsPresent("spam", "ham")(node, attr)).toMatchInlineSnapshot(
			`"requires <spam> or <ham> as parent"`,
		);
	});
});
