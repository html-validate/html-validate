import { DynamicValue, HtmlElement } from "../../dom";
import { hasAriaLabel } from "./has-aria-label";

test("should return true if element has aria-label with text", () => {
	const node = new HtmlElement("img");
	node.setAttribute("aria-label", "foobar", null, null);
	expect(hasAriaLabel(node)).toBeTruthy();
});

test("should return true if element has dynamic aria-label", () => {
	const node = new HtmlElement("img");
	node.setAttribute("aria-label", new DynamicValue("expr"), null, null);
	expect(hasAriaLabel(node)).toBeTruthy();
});

test("should return false if element does not have aria-label", () => {
	const node = new HtmlElement("img");
	expect(hasAriaLabel(node)).toBeFalsy();
});

test("should return false if element has empty aria-label text", () => {
	const node = new HtmlElement("img");
	node.setAttribute("aria-label", "", null, null);
	expect(hasAriaLabel(node)).toBeFalsy();
});

test("should return false if element has boolean aria-label attribute", () => {
	const node = new HtmlElement("img");
	node.setAttribute("aria-label", null, null, null);
	expect(hasAriaLabel(node)).toBeFalsy();
});
