import { ComplexSelector } from "./complex-selector";
import { getCompounds } from "./get-compounds";
import { type Selector } from "./selector";

/**
 * Parse given selector.
 *
 * @internal
 */
export function parseSelector(selector: string): Selector {
	const compounds = getCompounds(selector);
	return ComplexSelector.fromCompounds(compounds);
}
