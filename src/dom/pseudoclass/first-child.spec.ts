import { type Location } from "../../context";
import { HtmlElement } from "../htmlelement";
import { firstChild } from "./first-child";

const location: Location = {
	filename: "inline",
	line: 1,
	column: 1,
	offset: 0,
	size: 1,
};

it("should return true if element is first child", () => {
	expect.assertions(2);
	const parent = HtmlElement.createElement("parent", location);
	const a = HtmlElement.createElement("a", location, { parent });
	const b = HtmlElement.createElement("b", location, { parent });
	expect(firstChild(a)).toBeTruthy();
	expect(firstChild(b)).toBeFalsy();
});
