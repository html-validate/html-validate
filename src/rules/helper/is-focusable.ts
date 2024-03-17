import { type HtmlElement } from "../../dom";
import { isHTMLHidden, isInert, isStyleHidden } from "./a11y";

/**
 * Tests if an element is focusable.
 *
 * @internal
 */
export function isFocusable(element: HtmlElement): boolean {
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

	return Boolean(meta?.focusable);
}
