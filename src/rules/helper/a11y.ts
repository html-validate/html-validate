import { type HtmlElement, parseCssDeclaration } from "../../dom";

export interface IsHiddenResult {
	byParent: boolean;
	bySelf: boolean;
}

declare module "../../dom/cache" {
	export interface DOMNodeCache {
		[ARIA_HIDDEN_CACHE]: IsHiddenResult;
		[HTML_HIDDEN_CACHE]: IsHiddenResult;
		[ROLE_PRESENTATION_CACHE]: boolean;
		[STYLE_HIDDEN_CACHE]: boolean;
	}
}

const ARIA_HIDDEN_CACHE = Symbol(isAriaHidden.name);
const HTML_HIDDEN_CACHE = Symbol(isHTMLHidden.name);
const ROLE_PRESENTATION_CACHE = Symbol(isPresentation.name);
const STYLE_HIDDEN_CACHE = Symbol(isStyleHidden.name);

/**
 * Tests if this element is present in the accessibility tree.
 *
 * In practice it tests whenever the element or its parents has
 * `role="presentation"` or `aria-hidden="false"`. Dynamic values counts as
 * visible since the element might be in the visibility tree sometimes.
 */
export function inAccessibilityTree(node: HtmlElement): boolean {
	if (isAriaHidden(node)) {
		return false;
	}
	if (isPresentation(node)) {
		return false;
	}
	if (isHTMLHidden(node)) {
		return false;
	}
	if (isStyleHidden(node)) {
		return false;
	}
	return true;
}

function isAriaHiddenImpl(node: HtmlElement): IsHiddenResult {
	const isHidden = (node: HtmlElement): boolean => {
		const ariaHidden = node.getAttribute("aria-hidden");
		return Boolean(ariaHidden && ariaHidden.value === "true");
	};
	return {
		byParent: node.parent ? isAriaHidden(node.parent) : false,
		bySelf: isHidden(node),
	};
}

/**
 * Tests if this element or an ancestor have `aria-hidden="true"`.
 *
 * Dynamic values yields `false` since the element will conditionally be in the
 * accessibility tree and must fulfill it's conditions.
 */
export function isAriaHidden(node: HtmlElement): boolean;
export function isAriaHidden(node: HtmlElement, details: true): IsHiddenResult;
export function isAriaHidden(node: HtmlElement, details?: true): boolean | IsHiddenResult {
	const cached = node.cacheGet(ARIA_HIDDEN_CACHE);
	if (cached) {
		return details ? cached : cached.byParent || cached.bySelf;
	}
	const result = node.cacheSet(ARIA_HIDDEN_CACHE, isAriaHiddenImpl(node));
	return details ? result : result.byParent || result.bySelf;
}

function isHTMLHiddenImpl(node: HtmlElement): IsHiddenResult {
	const isHidden = (node: HtmlElement): boolean => {
		const hidden = node.getAttribute("hidden");
		return hidden !== null && hidden.isStatic;
	};
	return {
		byParent: node.parent ? isHTMLHidden(node.parent) : false,
		bySelf: isHidden(node),
	};
}

/**
 * Tests if this element or an ancestor have `hidden` attribute.
 *
 * Dynamic values yields `false` since the element will conditionally be in the
 * DOM tree and must fulfill it's conditions.
 */
export function isHTMLHidden(node: HtmlElement): boolean;
export function isHTMLHidden(node: HtmlElement, details: true): IsHiddenResult;
export function isHTMLHidden(node: HtmlElement, details?: true): boolean | IsHiddenResult {
	const cached = node.cacheGet(HTML_HIDDEN_CACHE);
	if (cached) {
		return details ? cached : cached.byParent || cached.bySelf;
	}
	const result = node.cacheSet(HTML_HIDDEN_CACHE, isHTMLHiddenImpl(node));
	return details ? result : result.byParent || result.bySelf;
}

function isStyleHiddenImpl(node: HtmlElement): boolean {
	const isHidden = (node: HtmlElement): boolean => {
		const style = node.getAttribute("style");
		const { display, visibility } = parseCssDeclaration(style?.value);
		return display === "none" || visibility === "hidden";
	};
	const byParent = node.parent ? isStyleHidden(node.parent) : false;
	const bySelf = isHidden(node);
	return byParent || bySelf;
}

/**
 * Tests if this element or an ancestor have `hidden` attribute.
 *
 * Dynamic values yields `false` since the element will conditionally be in the
 * DOM tree and must fulfill it's conditions.
 *
 * @internal
 */
export function isStyleHidden(node: HtmlElement): boolean {
	const cached = node.cacheGet(STYLE_HIDDEN_CACHE);
	if (cached) {
		return cached;
	}
	return node.cacheSet(STYLE_HIDDEN_CACHE, isStyleHiddenImpl(node));
}

/**
 * Tests if this element has role="presentation".
 *
 * Dynamic values yields `false` just as if the attribute wasn't present.
 */
export function isPresentation(node: HtmlElement): boolean {
	if (node.cacheExists(ROLE_PRESENTATION_CACHE)) {
		return Boolean(node.cacheGet(ROLE_PRESENTATION_CACHE));
	}

	const role = node.getAttribute("role");
	if (role && role.value === "presentation") {
		return node.cacheSet(ROLE_PRESENTATION_CACHE, true);
	} else {
		return node.cacheSet(ROLE_PRESENTATION_CACHE, false);
	}
}
