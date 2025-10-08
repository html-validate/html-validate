import { type DOMInternalID } from "../domnode";
import { type HtmlElement } from "../htmlelement";

const cache: Record<DOMInternalID, number> = {};

function getNthChild(node: HtmlElement): number {
	if (!node.parent) {
		return -1;
	}

	if (!cache[node.unique]) {
		const parent = node.parent;
		const index = parent.childElements.findIndex((cur) => {
			return cur.unique === node.unique;
		});
		cache[node.unique] = index + 1; /* nthChild starts at 1 */
	}

	return cache[node.unique];
}

export function nthChild(node: HtmlElement, args?: string): boolean {
	if (!args) {
		throw new Error("Missing argument to nth-child");
	}
	const n = parseInt(args.trim(), 10);
	const cur = getNthChild(node);
	return cur === n;
}
