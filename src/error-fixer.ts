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

	/**
	 * Removes the text at location, optionally trimming whitespace before or
	 * after.
	 *
	 * @example
	 *
	 * Given an element with the `foo` attribute:
	 *
	 * ```html
	 * <div foo="bar">
	 * ```
	 *
	 * To remove the attribute:
	 *
	 * ```ts
	 * const attr = node.getAttribute("foo");
	 * fixer.removeText(attr.location)
	 * ```
	 *
	 * Optionally, the whitespace before the attribute can be trimmed:
	 *
	 * ```ts
	 * fixer.removeText(attr.location, { trimStart: true });
	 * ```
	 *
	 * Resulting in `<div>` instead of `<div >`
	 *
	 * @public
	 * @since %version%
	 * @param location - The location of text to remove.
	 * @param options - Options
	 */
	removeText(
		location: Location,
		options?: {
			/**
			 * Remove whitespace characters before the specified location, up to and
			 * including a single newline if present.
			 *
			 * Defaults to `false`.
			 */
			trimStart?: boolean;

			/**
			 * Remove whitespace characters after the specified location, up to and
			 * including a single newline if present.
			 *
			 * Defaults to `false`.
			 */
			trimEnd?: boolean;
		},
	): void;
}
