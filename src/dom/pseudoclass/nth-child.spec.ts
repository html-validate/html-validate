import { type Location } from "../../context";
import { HtmlElement, NodeClosed } from "../htmlelement";
import { nthChild } from "./nth-child";

const location: Location = {
	filename: "inline",
	line: 1,
	column: 1,
	offset: 0,
	size: 1,
};

it("should return true if :nth-child matches", () => {
	expect.assertions(2);
	const parent = new HtmlElement("parent", null, NodeClosed.EndTag, null, location);
	const el = new HtmlElement("a", parent, NodeClosed.EndTag, null, location);
	expect(nthChild(el, "1")).toBeTruthy();
	expect(nthChild(el, "2")).toBeFalsy();
});

it("should not count text nodes", () => {
	expect.assertions(2);
	const parent = new HtmlElement("parent", null, NodeClosed.EndTag, null, location);
	const a = new HtmlElement("a", parent, NodeClosed.EndTag, null, location);
	parent.appendText("text", location);
	const b = new HtmlElement("b", parent, NodeClosed.EndTag, null, location);
	expect(nthChild(a, "1")).toBeTruthy();
	expect(nthChild(b, "2")).toBeTruthy();
});

it("should handle missing parent", () => {
	expect.assertions(1);
	const el = new HtmlElement("a", null, NodeClosed.EndTag, null, location);
	expect(nthChild(el, "1")).toBeFalsy();
});

it("should throw error when argument is missing", () => {
	expect.assertions(1);
	const el = new HtmlElement("a", null, NodeClosed.EndTag, null, location);
	expect(() => nthChild(el)).toThrow("Missing argument to nth-child");
});
