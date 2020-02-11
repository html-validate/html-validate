import { HtmlElement } from "../htmlelement";
import { firstChild } from "./first-child";

it("should return true if element is first child", () => {
	expect.assertions(2);
	const parent = new HtmlElement("parent");
	const a = new HtmlElement("a", parent);
	const b = new HtmlElement("b", parent);
	expect(firstChild(a)).toBeTruthy();
	expect(firstChild(b)).toBeFalsy();
});
