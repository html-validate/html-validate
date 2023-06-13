/**
 * Joins a list of words into natural language.
 *
 * - `["foo"]` becomes `"foo"`
 * - `["foo", "bar"]` becomes `"foo or bar"`
 * - `["foo", "bar", "baz"]` becomes `"foo, bar or baz"`
 * - and so on...
 *
 * @internal
 * @param values - List of words to join
 * @param conjunction - Conjunction for the last element.
 * @returns String with the words naturally joined with a conjunction.
 */
export function naturalJoin(values: string[], conjunction: string = "or"): string {
	switch (values.length) {
		case 0:
			return "";
		case 1:
			return values[0];
		case 2:
			return `${values[0]} ${conjunction} ${values[1]}`;
		default:
			return `${values.slice(0, -1).join(", ")} ${conjunction} ${values.slice(-1)[0]}`;
	}
}
