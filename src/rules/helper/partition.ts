/**
 * Partition an array to two new lists based on the result of a
 * predicate. Similar to `Array.filter` but returns both matching and
 * non-matching in the same call.
 *
 * Elements matching the predicate is placed in the first array and elements not
 * matching is placed in the second.
 *
 * @public
 * @param values - The array of values to partition.
 * @param predicate - A predicate function taking a single element and returning
 * a boolean.
 * @returns - Two arrays where the first contains all elements where the
 * predicate matched and second contains the rest of the elements.
 */
export function partition<T>(
	values: T[],
	predicate: (value: T, index: number, values: T[]) => boolean,
): [matching: T[], nonmatching: T[]] {
	const initial: [T[], T[]] = [[], []];
	return values.reduce((accumulator, value, index) => {
		const match = predicate(value, index, values);
		accumulator[match ? 0 : 1].push(value);
		return accumulator;
	}, initial);
}
