import { type Location } from "../../context";
import { HtmlElement } from "../htmlelement";
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
	const parent = HtmlElement.createElement("parent", location);
	const el = HtmlElement.createElement("a", location, { parent });
	expect(nthChild(el, "1")).toBeTruthy();
	expect(nthChild(el, "2")).toBeFalsy();
});

it("should not count text nodes", () => {
	expect.assertions(2);
	const parent = HtmlElement.createElement("parent", location);
	const a = HtmlElement.createElement("a", location, { parent });
	parent.appendText("text", location);
	const b = HtmlElement.createElement("b", location, { parent });
	expect(nthChild(a, "1")).toBeTruthy();
	expect(nthChild(b, "2")).toBeTruthy();
});

it("should handle missing parent", () => {
	expect.assertions(1);
	const el = HtmlElement.createElement("a", location);
	expect(nthChild(el, "1")).toBeFalsy();
});

it("should throw error when argument is missing", () => {
	expect.assertions(1);
	const el = HtmlElement.createElement("a", location);
	expect(() => nthChild(el)).toThrow("Missing argument to nth-child");
});
