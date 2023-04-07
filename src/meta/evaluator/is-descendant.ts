import { type HtmlElement } from "../../dom";

/**
 * Returns true if given element is a descendant of given tagname.
 *
 * @internal
 */
export function isDescendant(node: HtmlElement, tagName: string): boolean {
	let cur: HtmlElement | null = node.parent;
	while (cur && !cur.isRootElement()) {
		if (cur.is(tagName)) {
			return true;
		}
		cur = cur.parent;
	}
	return false;
}
