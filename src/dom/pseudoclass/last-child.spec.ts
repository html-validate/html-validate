import { HtmlElement } from "../htmlelement";
import { lastChild } from "./last-child";

it("should return true if element is last child", () => {
	expect.assertions(2);
	const parent = new HtmlElement("parent");
	const a = new HtmlElement("a", parent);
	const b = new HtmlElement("b", parent);
	expect(lastChild(a)).toBeFalsy();
	expect(lastChild(b)).toBeTruthy();
});
