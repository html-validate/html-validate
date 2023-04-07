import { type HtmlElement } from "../htmlelement";

export function lastChild(node: HtmlElement): boolean {
	return node.nextSibling === null;
}
