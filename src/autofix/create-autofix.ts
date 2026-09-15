import { type Autofix, type AutofixFn } from "./autofix";
import { bindAutofix } from "./bind-autofix";

/**
 * Manually create an {@link Autofix} instance.
 *
 * The purpose of this function is to be used when writing unittests related to
 * autofixing. For normal usage the `fix` or `suggestions` properties of the
 * `Message` objects should be used.
 *
 * It is undefined behavior to reuse the same `fix` parameter, or to reuse it
 * for other purposes.
 *
 * @example
 *
 * ```ts
 * const bound = createAutofix(text, (fixer) => {
 *   // body
 * });
 * ```
 *
 * @public
 * @since 11.16.0
 * @param text - The source text the callback operates on.
 * @param fix - The autofix or suggestion callback to bind.
 * @returns An {@link Autofix} instance.
 */
export function createAutofix(text: string, fix: AutofixFn): Autofix {
	return bindAutofix(text, fix);
}
