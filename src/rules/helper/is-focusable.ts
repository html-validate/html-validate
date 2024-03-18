import { type HtmlElement } from "../../dom";
import { type MetaElement } from "../../meta";
import { isHTMLHidden, isInert, isStyleHidden } from "./a11y";

declare module "../../dom/cache" {
	export interface DOMNodeCache {
		[FOCUSABLE_CACHE]: boolean;
	}
}

const FOCUSABLE_CACHE = Symbol(isFocusable.name);

function isDisabled(element: HtmlElement, meta: MetaElement): boolean {
	if (!meta.formAssociated?.disablable) {
		return false;
	}

	const disabled = element.matches("[disabled]");
	if (disabled) {
		return true;
	}

	const fieldset = element.closest("fieldset[disabled]");
	if (fieldset) {
		return true;
	}

	return false;
}

function isFocusableImpl(element: HtmlElement): boolean {
	/* if the element is hidden it is not focusable */
	if (isHTMLHidden(element) || isInert(element) || isStyleHidden(element)) {
		return false;
	}

	const { tabIndex, meta } = element;

	/* if tabindex is present (no matter the value) it takes precedence over
	metadata as it can be used to disable otherwise focusable elements */
	if (tabIndex !== null) {
		return tabIndex >= 0;
	}

	if (!meta) {
		return false;
	}

	if (isDisabled(element, meta)) {
		return false;
	}

	return Boolean(meta?.focusable);
}

/**
 * Tests if an element is focusable.
 *
 * @internal
 */
export function isFocusable(element: HtmlElement): boolean {
	const cached = element.cacheGet(FOCUSABLE_CACHE);
	/* istanbul ignore next: no need to test cache */
	if (cached) {
		return cached;
	}
	return element.cacheSet(FOCUSABLE_CACHE, isFocusableImpl(element));
}
