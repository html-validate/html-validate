import { DynamicValue, HtmlElement } from "../../dom";
import { hasAltText } from "./has-alt-text";

test("should return true if image has alt text", () => {
	const node = new HtmlElement("img");
	node.setAttribute("alt", "foobar", null, null);
	expect(hasAltText(node)).toBeTruthy();
});

test("should return true if image has dynamic alt text", () => {
	const node = new HtmlElement("img");
	node.setAttribute("alt", new DynamicValue("expr"), null, null);
	expect(hasAltText(node)).toBeTruthy();
});

test("should return false if image is missing alt text", () => {
	const node = new HtmlElement("img");
	expect(hasAltText(node)).toBeFalsy();
});

test("should return false if image has empty alt text", () => {
	const node = new HtmlElement("img");
	node.setAttribute("alt", "", null, null);
	expect(hasAltText(node)).toBeFalsy();
});

test("should return false if image has boolean alt attribute", () => {
	const node = new HtmlElement("img");
	node.setAttribute("alt", null, null, null);
	expect(hasAltText(node)).toBeFalsy();
});
