import { Location } from "../../context";
import { HtmlElement, NodeClosed } from "../htmlelement";
import { SelectorContext } from "../selector-context";
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
	const parent = new HtmlElement("parent", null, NodeClosed.EndTag, null, location);
	const a = new HtmlElement("a", parent, NodeClosed.EndTag, null, location);
	const b = new HtmlElement("b", parent, NodeClosed.EndTag, null, location);
	const context: SelectorContext = {
		scope: a,
	};
	expect(scope.call(context, a)).toBeTruthy();
	expect(scope.call(context, b)).toBeFalsy();
});
