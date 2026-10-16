import { expect, it } from "@jest/globals";
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
	const result = Array.from(splitSelectorElements("foo\\9 bar"));
	expect(result).toEqual(["foo\\9 bar"]);
});

it("should not split on escaped \\n (codepoint)", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("foo\\a bar"));
	expect(result).toEqual(["foo\\a bar"]);
});

it("should not split on escaped \\r (codepoint)", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("foo\\d bar"));
	expect(result).toEqual(["foo\\d bar"]);
});

it("should split on word ending with 9 (collides with \\9 escape)", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("foo9 bar"));
	expect(result).toEqual(["foo9", "bar"]);
});

it("should split on word ending with a (collides with \\a escape)", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("fooa bar"));
	expect(result).toEqual(["fooa", "bar"]);
});

it("should split on word ending with d (collides with \\d escape)", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("food bar"));
	expect(result).toEqual(["food", "bar"]);
});

it("should handle empty selector", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements(""));
	expect(result).toEqual([]);
});
