import { type Autofix, type AutofixFn } from "./autofix";
import { autofixSymbol } from "./autofix-symbol";

interface AutofixInternal extends Autofix {
	[autofixSymbol]: string | undefined;
}

/**
 * Bind a fix (or suggestion) callback to the source text it operates on.
 *
 * @internal
 */
export function bindAutofix(text: string, fix: AutofixFn): Autofix {
	const boundFix = ((fixer) => fix(fixer)) as AutofixInternal;
	boundFix[autofixSymbol] = text;
	return boundFix;
}

/**
 * Get the source text a {@link Autofix} was bound to.
 *
 * @internal
 */
export function getBoundSourceText(fix: Autofix): string {
	const boundFix = fix as AutofixInternal;
	return boundFix[autofixSymbol] ?? "";
}
