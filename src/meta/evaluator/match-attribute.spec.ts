import { ResolvedConfig } from "../../config";
import { Parser } from "../../parser";
import { MetaTable } from "../table";
import { matchAttribute } from "./match-attribute";

const metaTable = new MetaTable();
const config = new ResolvedConfig(
	{ metaTable, plugins: [], rules: new Map(), transformers: [] },
	{},
);
const parser = new Parser(config);

describe("operator =", () => {
	it("should be true if attribute equals given value", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<foo bar="baz"></foo>`;
		const dom = parser.parseHtml(markup);
		const element = dom.querySelector("foo")!;
		expect(matchAttribute(element, "bar", "=", "baz")).toBeTruthy();
	});

	it("should be true if attribute equals given value (case-insensitive)", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<foo bar="BAZ"></foo>`;
		const dom = parser.parseHtml(markup);
		const element = dom.querySelector("foo")!;
		expect(matchAttribute(element, "bar", "=", "baz")).toBeTruthy();
	});

	it("should be false if attribute does not equal given value", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<foo bar="baz"></foo>`;
		const dom = parser.parseHtml(markup);
		const element = dom.querySelector("foo")!;
		expect(matchAttribute(element, "bar", "=", "spam")).toBeFalsy();
	});

	it("should handle boolean attributes as empty string", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<foo bar></foo>`;
		const dom = parser.parseHtml(markup);
		const element = dom.querySelector("foo")!;
		expect(matchAttribute(element, "bar", "=", "")).toBeTruthy();
	});
});

describe("operator !=", () => {
	it("should be false if attribute equals given value", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<foo bar="baz"></foo>`;
		const dom = parser.parseHtml(markup);
		const element = dom.querySelector("foo")!;
		expect(matchAttribute(element, "bar", "!=", "baz")).toBeFalsy();
	});

	it("should be false if attribute equals given value (case-insensitive)", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<foo bar="BAZ"></foo>`;
		const dom = parser.parseHtml(markup);
		const element = dom.querySelector("foo")!;
		expect(matchAttribute(element, "bar", "!=", "baz")).toBeFalsy();
	});

	it("should be true if attribute does not equal given value", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<foo bar="baz"></foo>`;
		const dom = parser.parseHtml(markup);
		const element = dom.querySelector("foo")!;
		expect(matchAttribute(element, "bar", "!=", "spam")).toBeTruthy();
	});

	it("should handle boolean attributes as empty string", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<foo bar></foo>`;
		const dom = parser.parseHtml(markup);
		const element = dom.querySelector("foo")!;
		expect(matchAttribute(element, "bar", "!=", "")).toBeFalsy();
	});
});
