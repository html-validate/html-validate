import { type Location } from "../../context";
import { DynamicValue, HtmlElement, NodeClosed } from "../../dom";
import { hasAriaLabel } from "./has-aria-label";

const location: Location = {
	filename: "inline",
	line: 1,
	column: 1,
	offset: 0,
	size: 1,
};

it("should return true if element has aria-label with text", () => {
	expect.assertions(1);
	const node = new HtmlElement("img", null, NodeClosed.EndTag, null, location);
	node.setAttribute("aria-label", "foobar", location, location);
	expect(hasAriaLabel(node)).toBeTruthy();
});

it("should return true if element has dynamic aria-label", () => {
	expect.assertions(1);
	const node = new HtmlElement("img", null, NodeClosed.EndTag, null, location);
	node.setAttribute("aria-label", new DynamicValue("expr"), location, location);
	expect(hasAriaLabel(node)).toBeTruthy();
});

it("should return false if element does not have aria-label", () => {
	expect.assertions(1);
	const node = new HtmlElement("img", null, NodeClosed.EndTag, null, location);
	expect(hasAriaLabel(node)).toBeFalsy();
});

it("should return false if element has empty aria-label text", () => {
	expect.assertions(1);
	const node = new HtmlElement("img", null, NodeClosed.EndTag, null, location);
	node.setAttribute("aria-label", "", location, location);
	expect(hasAriaLabel(node)).toBeFalsy();
});

it("should return false if element has boolean aria-label attribute", () => {
	expect.assertions(1);
	const node = new HtmlElement("img", null, NodeClosed.EndTag, null, location);
	node.setAttribute("aria-label", null, location, location);
	expect(hasAriaLabel(node)).toBeFalsy();
});
