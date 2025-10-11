import { type HtmlElement } from "../../dom";

declare module "../../dom/cache" {
	export interface DOMNodeCache {
		[INPUT_DISABLED_CACHE]: IsInputDisabledResult;
	}
}

/**
 * Result of {@link isInputDisabled}.
 *
 * @internal
 */
export interface IsInputDisabledResult {
	/** `true` if one or more fieldset ancestors are disabled */
	byFieldset: boolean;
	/** `true` if the element itself is inert */
	bySelf: boolean;
}

const INPUT_DISABLED_CACHE = Symbol(isInputDisabled.name);

/**
 * Tests if this input element or an ancestor fieldset are `disabled`.
 *
 * Dynamic values yields `false` since the input element will conditionally be
 * enabled.
 *
 * @internal
 */
export function isInputDisabled(node: HtmlElement): boolean;
export function isInputDisabled(node: HtmlElement, details: true): IsInputDisabledResult;
export function isInputDisabled(
	node: HtmlElement,
	details?: true,
): boolean | IsInputDisabledResult {
	const cached = node.cacheGet(INPUT_DISABLED_CACHE);
	if (cached) {
		return details ? cached : cached.byFieldset || cached.bySelf;
	}
	const result = node.cacheSet(INPUT_DISABLED_CACHE, isInputDisabledImpl(node));
	return details ? result : result.byFieldset || result.bySelf;
}

function isInputDisabledImpl(node: HtmlElement): IsInputDisabledResult {
	const hasDisabledAttr = (node: HtmlElement): boolean => {
		const disabled = node.getAttribute("disabled");
		return Boolean(disabled?.isStatic);
	};
	const hasDisabledFieldset = (node: HtmlElement): boolean => {
		const fieldset = node.closest("fieldset[disabled]");
		const disabled = fieldset?.getAttribute("disabled");
		return Boolean(disabled?.isStatic);
	};
	return {
		byFieldset: hasDisabledFieldset(node),
		bySelf: hasDisabledAttr(node),
	};
}
