import { ComplexSelector } from "./complex-selector";
import { getCompounds } from "./get-compounds";
import { type Selector } from "./selector";

const cache = new Map<string, Selector>();

/**
 * Parse given selector.
 *
 * @internal
 */
export function parseSelector(selector: string): Selector {
	const cached = cache.get(selector);
	if (cached) {
		return cached;
	}
	const compounds = getCompounds(selector);
	const result = ComplexSelector.fromCompounds(compounds);
	cache.set(selector, result);
	return result;
}
