import { type Autofix } from "./autofix";
import { autofixSymbol } from "./autofix-symbol";

/**
 * Returns true if value is an `Autofix` instance.
 *
 * @public
 * @since %version%
 */
export function isAutofix(value: unknown): value is Autofix {
	if (!value) {
		return false;
	}
	return Object.hasOwn(value, autofixSymbol);
}
