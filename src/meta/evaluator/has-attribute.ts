import { type HtmlElement } from "../../dom";

/**
 * Returns true if given element has given attribute (no matter the value, null,
 * dynamic, etc).
 */
export function hasAttribute(node: HtmlElement, attr: string): boolean {
	return node.hasAttribute(attr);
}
