import { type HtmlElement } from "../../dom";

declare module "../../dom/cache" {
	export interface DOMNodeCache {
		[FOREIGN_CACHE]: boolean;
	}
}

const FOREIGN_CACHE = Symbol(isForeign.name);

/**
 * Returns `true` if element or an ancestor element is a foreign element.
 *
 * @internal
 */
export function isForeign(node: HtmlElement | null): boolean {
	if (!node) {
		return false;
	}
	const cached = node.cacheGet(FOREIGN_CACHE);
	if (cached !== undefined) {
		return cached;
	}
	const parent = node.parent;
	const result = Boolean(node.meta?.foreign) || isForeign(parent);
	return node.cacheSet(FOREIGN_CACHE, result);
}
