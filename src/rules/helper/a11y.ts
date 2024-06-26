import { type HtmlElement, parseCssDeclaration } from "../../dom";

export interface IsHiddenResult {
	byParent: boolean;
	bySelf: boolean;
}

/**
 * Result of {@link isInert}.
 *
 * @internal
 */
export interface IsInertResult {
	/** `true` if one or more parents are inert */
	byParent: boolean;
	/** `true` if the element itself is inert */
	bySelf: boolean;
}

declare module "../../dom/cache" {
	export interface DOMNodeCache {
		[ARIA_HIDDEN_CACHE]: IsHiddenResult;
		[HTML_HIDDEN_CACHE]: IsHiddenResult;
		[INERT_CACHE]: IsInertResult;
		[ROLE_PRESENTATION_CACHE]: boolean;
		[STYLE_HIDDEN_CACHE]: boolean;
	}
}

const ARIA_HIDDEN_CACHE = Symbol(isAriaHidden.name);
const HTML_HIDDEN_CACHE = Symbol(isHTMLHidden.name);
const INERT_CACHE = Symbol(isInert.name);
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
	if (isInert(node)) {
		return false;
	}
	if (isStyleHidden(node)) {
		return false;
	}
	return true;
}

function isAriaHiddenImpl(node: HtmlElement): IsHiddenResult {
	const getAriaHiddenAttr = (node: HtmlElement): boolean => {
		const ariaHidden = node.getAttribute("aria-hidden");
		return Boolean(ariaHidden && ariaHidden.value === "true");
	};
	return {
		byParent: node.parent ? isAriaHidden(node.parent) : false,
		bySelf: getAriaHiddenAttr(node),
	};
}

/**
 * Tests if this element or an ancestor have `aria-hidden="true"`.
 *
 * Dynamic values yields `false` since the element will conditionally be in the
 * accessibility tree and must fulfill it's conditions.
 *
 * @internal
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
	const getHiddenAttr = (node: HtmlElement): boolean => {
		const hidden = node.getAttribute("hidden");
		return Boolean(hidden?.isStatic);
	};
	return {
		byParent: node.parent ? isHTMLHidden(node.parent) : false,
		bySelf: getHiddenAttr(node),
	};
}

/**
 * Tests if this element or an ancestor have `hidden` attribute.
 *
 * Dynamic values yields `false` since the element will conditionally be in the
 * DOM tree and must fulfill it's conditions.
 *
 * @internal
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

function isInertImpl(node: HtmlElement): IsHiddenResult {
	const getInertAttr = (node: HtmlElement): boolean => {
		const inert = node.getAttribute("inert");
		return Boolean(inert?.isStatic);
	};
	return {
		byParent: node.parent ? isInert(node.parent) : false,
		bySelf: getInertAttr(node),
	};
}

/**
 * Tests if this element or an ancestor have `inert` attribute.
 *
 * Dynamic values yields `false` since the element will conditionally be in the
 * DOM tree and must fulfill it's conditions.
 *
 * @internal
 */
export function isInert(node: HtmlElement): boolean;
export function isInert(node: HtmlElement, details: true): IsInertResult;
export function isInert(node: HtmlElement, details?: true): boolean | IsInertResult {
	const cached = node.cacheGet(INERT_CACHE);
	if (cached) {
		return details ? cached : cached.byParent || cached.bySelf;
	}
	const result = node.cacheSet(INERT_CACHE, isInertImpl(node));
	return details ? result : result.byParent || result.bySelf;
}

function isStyleHiddenImpl(node: HtmlElement): boolean {
	const getStyleAttr = (node: HtmlElement): boolean => {
		const style = node.getAttribute("style");
		const { display, visibility } = parseCssDeclaration(style?.value);
		return display === "none" || visibility === "hidden";
	};
	const byParent = node.parent ? isStyleHidden(node.parent) : false;
	const bySelf = getStyleAttr(node);
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
 * Tests if this element has `role="presentation"` or `role="none"`.
 *
 * Dynamic values yields `false` just as if the attribute wasn't present.
 */
export function isPresentation(node: HtmlElement): boolean {
	if (node.cacheExists(ROLE_PRESENTATION_CACHE)) {
		return Boolean(node.cacheGet(ROLE_PRESENTATION_CACHE));
	}

	/* interactive elements ignores `role="presentation"` */
	const meta = node.meta;
	if (meta?.interactive) {
		return node.cacheSet(ROLE_PRESENTATION_CACHE, false);
	}

	/* focusable elements ignores `role="presentation"` */
	const tabindex = node.getAttribute("tabindex");
	if (tabindex) {
		return node.cacheSet(ROLE_PRESENTATION_CACHE, false);
	}

	const role = node.getAttribute("role");
	if (role && (role.value === "presentation" || role.value === "none")) {
		return node.cacheSet(ROLE_PRESENTATION_CACHE, true);
	} else {
		return node.cacheSet(ROLE_PRESENTATION_CACHE, false);
	}
}
