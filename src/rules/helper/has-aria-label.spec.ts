import { DynamicValue, HtmlElement } from "../../dom";
import { hasAriaLabel } from "./has-aria-label";

it("should return true if element has aria-label with text", () => {
	expect.assertions(1);
	const node = new HtmlElement("img");
	node.setAttribute("aria-label", "foobar", null, null);
	expect(hasAriaLabel(node)).toBeTruthy();
});

it("should return true if element has dynamic aria-label", () => {
	expect.assertions(1);
	const node = new HtmlElement("img");
	node.setAttribute("aria-label", new DynamicValue("expr"), null, null);
	expect(hasAriaLabel(node)).toBeTruthy();
});

it("should return false if element does not have aria-label", () => {
	expect.assertions(1);
	const node = new HtmlElement("img");
	expect(hasAriaLabel(node)).toBeFalsy();
});

it("should return false if element has empty aria-label text", () => {
	expect.assertions(1);
	const node = new HtmlElement("img");
	node.setAttribute("aria-label", "", null, null);
	expect(hasAriaLabel(node)).toBeFalsy();
});

it("should return false if element has boolean aria-label attribute", () => {
	expect.assertions(1);
	const node = new HtmlElement("img");
	node.setAttribute("aria-label", null, null, null);
	expect(hasAriaLabel(node)).toBeFalsy();
});
