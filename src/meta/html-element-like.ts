import { type DynamicValue } from "../dom";

/**
 * HTML5 interface for HTMLElement. Contains all the needed methods the
 * HTML-Validate metadata requires to determine if usage is valid.
 *
 * While not officially supported, changes to this interface should be verified
 * against browsers and/or jsdom, i.e. it should be possible to pass in either
 * implementation and the element metadata should still work.
 *
 * @public
 * @since 8.2.0
 */
export interface HtmlElementLike {
	closest(selectors: string): HtmlElementLike | null | undefined;
	getAttribute(name: string): string | DynamicValue | null | undefined;
	hasAttribute(name: string): boolean;
}
