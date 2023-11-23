import { ResolvedConfig } from "../../config";
import { Parser } from "../../parser";
import { MetaTable } from "../table";
import { hasAttribute } from "./has-attribute";

const metaTable = new MetaTable();
const config = new ResolvedConfig(
	{ metaTable, plugins: [], rules: new Map(), transformers: [] },
	{},
);
const parser = new Parser(config);

it("should be true if element has given attribute", () => {
	expect.assertions(1);
	const markup = /* HTML */ `<foo bar="baz"></foo>`;
	const dom = parser.parseHtml(markup);
	const element = dom.querySelector("foo")!;
	expect(hasAttribute(element, "bar")).toBeTruthy();
});

it("should be true if element has given attribute (empty)", () => {
	expect.assertions(1);
	const markup = /* HTML */ `<foo bar=""></foo>`;
	const dom = parser.parseHtml(markup);
	const element = dom.querySelector("foo")!;
	expect(hasAttribute(element, "bar")).toBeTruthy();
});

it("should be true if element has given attribute (boolean)", () => {
	expect.assertions(1);
	const markup = /* HTML */ `<foo bar></foo>`;
	const dom = parser.parseHtml(markup);
	const element = dom.querySelector("foo")!;
	expect(hasAttribute(element, "bar")).toBeTruthy();
});

it("should be false if element does not have given element", () => {
	expect.assertions(1);
	const markup = /* HTML */ `<foo></foo>`;
	const dom = parser.parseHtml(markup);
	const element = dom.querySelector("foo")!;
	expect(hasAttribute(element, "bar")).toBeFalsy();
});
