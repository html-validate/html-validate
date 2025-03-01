import { type Location } from "../../context";
import { HtmlElement } from "../htmlelement";
import { type SelectorContext } from "../selector";
import { scope } from "./scope";

const location: Location = {
	filename: "inline",
	line: 1,
	column: 1,
	offset: 0,
	size: 1,
};

it("should return true if matching itself", () => {
	expect.assertions(2);
	const parent = HtmlElement.createElement("parent", location);
	const a = HtmlElement.createElement("a", location, { parent });
	const b = HtmlElement.createElement("b", location, { parent });
	const context: SelectorContext = {
		scope: a,
	};
	expect(scope.call(context, a)).toBeTruthy();
	expect(scope.call(context, b)).toBeFalsy();
});
