import { type Location } from "../../context";
import { DynamicValue, HtmlElement } from "../../dom";
import { hasAltText } from "./has-alt-text";

const location: Location = {
	filename: "inline",
	line: 1,
	column: 1,
	offset: 0,
	size: 1,
};

it("should return true if image has alt text", () => {
	expect.assertions(1);
	const node = HtmlElement.createElement("img", location);
	node.setAttribute("alt", "foobar", location, location);
	expect(hasAltText(node)).toBeTruthy();
});

it("should return true if image has dynamic alt text", () => {
	expect.assertions(1);
	const node = HtmlElement.createElement("img", location);
	node.setAttribute("alt", new DynamicValue("expr"), location, location);
	expect(hasAltText(node)).toBeTruthy();
});

it("should return false if image is missing alt text", () => {
	expect.assertions(1);
	const node = HtmlElement.createElement("img", location);
	expect(hasAltText(node)).toBeFalsy();
});

it("should return false if image has empty alt text", () => {
	expect.assertions(1);
	const node = HtmlElement.createElement("img", location);
	node.setAttribute("alt", "", location, location);
	expect(hasAltText(node)).toBeFalsy();
});

it("should return false if image has boolean alt attribute", () => {
	expect.assertions(1);
	const node = HtmlElement.createElement("img", location);
	node.setAttribute("alt", null, location, location);
	expect(hasAltText(node)).toBeFalsy();
});
