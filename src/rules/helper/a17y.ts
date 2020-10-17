import { HtmlElement } from "../../dom";

declare module "../../dom/cache" {
	export interface DOMNodeCache {
		[ARIA_HIDDEN_CACHE]: boolean;
		[ROLE_PRESENTATION_CACHE]: boolean;
	}
}

const ARIA_HIDDEN_CACHE = Symbol(isAriaHidden.name);
const ROLE_PRESENTATION_CACHE = Symbol(isPresentation.name);

/**
 * Tests if this element is present in the accessibility tree.
 *
 * In practice it tests whenever the element or its parents has
 * `role="presentation"` or `aria-hidden="false"`. Dynamic values counts as
 * visible since the element might be in the visibility tree sometimes.
 */
export function inAccessibilityTree(node: HtmlElement): boolean {
	return !isAriaHidden(node) && !isPresentation(node);
}

/**
 * Tests if this element or an ancestor have `aria-hidden="true"`.
 *
 * Dynamic values yields `false` since the element will conditionally be in the
 * accessibility tree and must fulfill it's conditions.
 */
export function isAriaHidden(node: HtmlElement): boolean {
	if (node.cacheExists(ARIA_HIDDEN_CACHE)) {
		return node.cacheGet(ARIA_HIDDEN_CACHE);
	}

	let cur: HtmlElement = node;
	do {
		const ariaHidden = cur.getAttribute("aria-hidden");

		/* aria-hidden="true" */
		if (ariaHidden && ariaHidden.value === "true") {
			return cur.cacheSet(ARIA_HIDDEN_CACHE, true);
		}

		/* check parents */
		cur = cur.parent;
	} while (!cur.isRootElement());

	return node.cacheSet(ARIA_HIDDEN_CACHE, false);
}

/**
 * Tests if this element or a parent element has role="presentation".
 *
 * Dynamic values yields `false` just as if the attribute wasn't present.
 */
export function isPresentation(node: HtmlElement): boolean {
	if (node.cacheExists(ROLE_PRESENTATION_CACHE)) {
		return node.cacheGet(ROLE_PRESENTATION_CACHE);
	}

	let cur: HtmlElement = node;
	do {
		const role = cur.getAttribute("role");

		/* role="presentation" */
		if (role && role.value === "presentation") {
			return cur.cacheSet(ROLE_PRESENTATION_CACHE, true);
		}

		/* check parents */
		cur = cur.parent;
	} while (!cur.isRootElement());

	return node.cacheSet(ROLE_PRESENTATION_CACHE, false);
}
