import { HtmlElement } from "../htmlelement";
import { nthChild } from "./nth-child";

it("should return true if :nth-child matches", () => {
	expect.assertions(2);
	const parent = new HtmlElement("parent");
	const el = new HtmlElement("a", parent);
	expect(nthChild(el, "1")).toBeTruthy();
	expect(nthChild(el, "2")).toBeFalsy();
});

it("should not count text nodes", () => {
	expect.assertions(2);
	const parent = new HtmlElement("parent");
	const a = new HtmlElement("a", parent);
	parent.appendText("text");
	const b = new HtmlElement("b", parent);
	expect(nthChild(a, "1")).toBeTruthy();
	expect(nthChild(b, "2")).toBeTruthy();
});

it("should handle missing parent", () => {
	expect.assertions(1);
	const el = new HtmlElement("a");
	expect(nthChild(el, "1")).toBeFalsy();
});
