import { type Location } from "./location";

/**
 * Methods to modify the original source to fix errors.
 *
 * @public
 * @since 11.12.0
 */
export interface ErrorFixer {
	/**
	 * Inserts text at just before location.
	 *
	 * @example
	 *
	 * ```ts
	 * fixer.insertTextBefore(location, "text");
	 * ```
	 *
	 * @public
	 * @since 11.15.0
	 * @see https://html-validate.org/api/error-fixer.html#inserttextbefore-method
	 * @param location - The location where text will be inserted at.
	 * @param insert - The text to insert.
	 */
	insertTextBefore(location: Location, insert: string): void;

	/**
	 * Inserts text at just after location.
	 *
	 * @example
	 *
	 * ```ts
	 * fixer.insertTextAfter(location, "text");
	 * ```
	 *
	 * @public
	 * @since 11.15.0
	 * @see https://html-validate.org/api/error-fixer.html#inserttextafter-method
	 * @param location - The location where text will be inserted at.
	 * @param insert - The text to insert.
	 */
	insertTextAfter(location: Location, insert: string): void;

	/**
	 * Replaces the text at location.
	 *
	 * @public
	 * @since 11.12.0
	 * @see https://html-validate.org/api/error-fixer.html#replacetext-method
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
	 * @since 11.12.0
	 * @see https://html-validate.org/api/error-fixer.html#removetext-method
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
