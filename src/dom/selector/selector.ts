import { type HtmlElement } from "../htmlelement";

/**
 * @internal
 */
export interface Selector {
	/**
	 * Match this selector against a HtmlElement.
	 *
	 * @param root - Element to match against.
	 * @returns Iterator with matched elements.
	 */
	match(root: HtmlElement): Generator<HtmlElement>;

	/**
	 * Returns `true` if the element matches this selector.
	 */
	matchElement(element: HtmlElement): boolean;
}
