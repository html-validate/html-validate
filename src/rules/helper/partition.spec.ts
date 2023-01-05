import { partition } from "./partition";

const numbers = [1, 2, 3, 4, 5, 6];

it("should partition array", () => {
	expect.assertions(2);
	const [even, odd] = partition(numbers, (value) => value % 2 === 0);
	expect(even).toEqual([2, 4, 6]);
	expect(odd).toEqual([1, 3, 5]);
});

it("should only matches", () => {
	expect.assertions(2);
	const [all, rest] = partition(numbers, () => true);
	expect(all).toEqual([1, 2, 3, 4, 5, 6]);
	expect(rest).toEqual([]);
});

it("should no matches", () => {
	expect.assertions(2);
	const [none, rest] = partition(numbers, () => false);
	expect(none).toEqual([]);
	expect(rest).toEqual([1, 2, 3, 4, 5, 6]);
});

it("should pass index to predicate", () => {
	expect.assertions(2);
	const [last, first] = partition(numbers, (_, index) => index >= 3 && index < 5);
	expect(last).toEqual([4, 5]);
	expect(first).toEqual([1, 2, 3, 6]);
});
