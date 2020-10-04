import { HtmlElement } from "../../dom";

declare module "../../dom/cache" {
	export interface DOMNodeCache {
		[CACHE_KEY]: boolean;
	}
}

const CACHE_KEY = Symbol(inAccessibilityTree.name);

/**
 * Tests if this element is present in the accessibility tree.
 *
 * In practice it tests whenever the element or its parents has
 * `role="presentation"` or `aria-hidden="false"`. Dynamic values counts as
 * visible since the element might be in the visibility tree sometimes.
 */
export function inAccessibilityTree(node: HtmlElement): boolean {
	if (node.cacheExists(CACHE_KEY)) {
		return node.cacheGet(CACHE_KEY);
	}

	let cur: HtmlElement = node;
	do {
		const role = cur.getAttribute("role");
		const ariaHidden = cur.getAttribute("aria-hidden");

		/* role="presentation" */
		if (role && role.value === "presentation") {
			return cur.cacheSet(CACHE_KEY, false);
		}

		/* aria-hidden="true" */
		if (ariaHidden && ariaHidden.value === "true") {
			return cur.cacheSet(CACHE_KEY, false);
		}

		/* check parents */
		cur = cur.parent;
	} while (!cur.isRootElement());

	return node.cacheSet(CACHE_KEY, true);
}
