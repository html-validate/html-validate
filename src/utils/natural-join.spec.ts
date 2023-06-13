import { naturalJoin } from "./natural-join";

it("should handle 0 elements", () => {
	expect.assertions(1);
	expect(naturalJoin([])).toBe("");
});

it("should handle 1 element", () => {
	expect.assertions(1);
	expect(naturalJoin(["foo"])).toBe("foo");
});

it("should handle 2 element", () => {
	expect.assertions(1);
	expect(naturalJoin(["foo", "bar"])).toBe("foo or bar");
});

it("should handle 3 element", () => {
	expect.assertions(1);
	expect(naturalJoin(["foo", "bar", "baz"])).toBe("foo, bar or baz");
});

it("should handle more elements", () => {
	expect.assertions(1);
	expect(naturalJoin(["1", "2", "3", "4", "5"])).toBe("1, 2, 3, 4 or 5");
});

it("should handle different conjunction", () => {
	expect.assertions(1);
	expect(naturalJoin(["foo", "bar", "baz"], "and")).toBe("foo, bar and baz");
});
