import { type ErrorFixer } from "../error-fixer";

declare const autofix: unique symbol;

/**
 * An autofix callback.
 *
 * @public
 * @since %version%
 */
export type AutofixFn = (fixer: ErrorFixer) => void | Promise<void>;

/**
 * An opaque autofix instance.
 *
 * @public
 * @since %version%
 */
export interface Autofix {
	readonly [autofix]: true;
	(fixer: ErrorFixer): void | Promise<void>;
}
