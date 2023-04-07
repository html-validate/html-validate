import { type HtmlElement } from "../htmlelement";

export function firstChild(node: HtmlElement): boolean {
	return node.previousSibling === null;
}
