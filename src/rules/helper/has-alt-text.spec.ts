import { DynamicValue, HtmlElement } from "../../dom";
import { hasAltText } from "./has-alt-text";

it("should return true if image has alt text", () => {
	expect.assertions(1);
	const node = new HtmlElement("img");
	node.setAttribute("alt", "foobar", null, null);
	expect(hasAltText(node)).toBeTruthy();
});

it("should return true if image has dynamic alt text", () => {
	expect.assertions(1);
	const node = new HtmlElement("img");
	node.setAttribute("alt", new DynamicValue("expr"), null, null);
	expect(hasAltText(node)).toBeTruthy();
});

it("should return false if image is missing alt text", () => {
	expect.assertions(1);
	const node = new HtmlElement("img");
	expect(hasAltText(node)).toBeFalsy();
});

it("should return false if image has empty alt text", () => {
	expect.assertions(1);
	const node = new HtmlElement("img");
	node.setAttribute("alt", "", null, null);
	expect(hasAltText(node)).toBeFalsy();
});

it("should return false if image has boolean alt attribute", () => {
	expect.assertions(1);
	const node = new HtmlElement("img");
	node.setAttribute("alt", null, null, null);
	expect(hasAltText(node)).toBeFalsy();
});
