import { type ErrorFixer } from "../error-fixer";

declare const autofix: unique symbol;

/**
 * An autofix callback.
 *
 * @public
 * @since 11.16.0
 */
export type AutofixFn = (fixer: ErrorFixer) => void | Promise<void>;

/**
 * An opaque autofix instance.
 *
 * @public
 * @since 11.16.0
 */
export interface Autofix {
	readonly [autofix]: true;
	(fixer: ErrorFixer): void | Promise<void>;
}
