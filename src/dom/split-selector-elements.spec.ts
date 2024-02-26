import { splitSelectorElements } from "./split-selector-elements";

it("should split on space", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("foo bar"));
	expect(result).toEqual(["foo", "bar"]);
});

it("should split on multiple spaces", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("foo   bar"));
	expect(result).toEqual(["foo", "bar"]);
});

it("should not split on escaped space", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("foo\\ bar"));
	expect(result).toEqual(["foo\\ bar"]);
});

it("should not split on escaped \\t (codepoint)", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("foo\\\u0039 bar"));
	expect(result).toEqual(["foo\\\u0039 bar"]);
});

it("should not split on escaped \\n (codepoint)", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("foo\\\u0061 bar"));
	expect(result).toEqual(["foo\\\u0061 bar"]);
});

it("should not split on escaped \\r (codepoint)", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("foo\\\u0064 bar"));
	expect(result).toEqual(["foo\\\u0064 bar"]);
});

it("should split on word ending with 9 (collides with \\\u0039 escape)", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("foo9 bar"));
	expect(result).toEqual(["foo9", "bar"]);
});

it("should split on word ending with a (collides with \\\u0061 escape)", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("fooa bar"));
	expect(result).toEqual(["fooa", "bar"]);
});

it("should split on word ending with d (collides with \\\u0064 escape)", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("food bar"));
	expect(result).toEqual(["food", "bar"]);
});
