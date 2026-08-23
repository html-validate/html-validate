import { type Location } from "./location";

/**
 * Methods to modify the original source to fix errors.
 *
 * @public
 * @since %version%
 */
export interface ErrorFixer {
	/**
	 * Replaces the text at location.
	 *
	 * @public
	 * @since %version%
	 * @param location - The location of text to replace.
	 * @param replacement - The text to replace current text with.
	 */
	replaceText(location: Location, replacement: string): void;
}
