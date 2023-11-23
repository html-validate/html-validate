import { ResolvedConfig } from "../../config";
import { Parser } from "../../parser";
import { MetaTable } from "../table";
import { isDescendant } from "./is-descendant";

const metaTable = new MetaTable();
const config = new ResolvedConfig(
	{ metaTable, plugins: [], rules: new Map(), transformers: [] },
	{},
);
const parser = new Parser(config);

it("should be true if child is a descendant of given tagName", () => {
	expect.assertions(2);
	const dom = parser.parseHtml("<foo><bar><child></child></bar></foo>");
	const element = dom.querySelector("child")!;
	expect(isDescendant(element, "foo")).toBeTruthy();
	expect(isDescendant(element, "bar")).toBeTruthy();
});

it("should be false if child is not a descendant of given tagName", () => {
	expect.assertions(1);
	const dom = parser.parseHtml("<foo><bar><child></child></bar></foo>");
	const element = dom.querySelector("child")!;
	expect(isDescendant(element, "baz")).toBeFalsy();
});
