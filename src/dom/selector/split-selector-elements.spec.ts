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

it.each([" ", "\t", "\n", "\r", "\f"])("should split on whitespace %j", (ch) => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements(`foo${ch}bar`));
	expect(result).toEqual(["foo", "bar"]);
});

it.each([">", "+", "~"])("should attach combinator %j to following compound", (combinator) => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements(`foo ${combinator} bar`));
	expect(result).toEqual(["foo", `${combinator}bar`]);
});

it("should handle combinator without whitespace", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("foo>bar"));
	expect(result).toEqual(["foo", ">bar"]);
});

it("should handle combinator with only leading or trailing whitespace", () => {
	expect.assertions(2);
	expect(Array.from(splitSelectorElements("foo >bar"))).toEqual(["foo", ">bar"]);
	expect(Array.from(splitSelectorElements("foo> bar"))).toEqual(["foo", ">bar"]);
});

it("should handle multiple whitespace around combinator", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("foo \t  >  \n bar"));
	expect(result).toEqual(["foo", ">bar"]);
});

it("should ignore leading whitespace", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("  foo bar"));
	expect(result).toEqual(["foo", "bar"]);
});

it("should handle leading combinator", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("> foo"));
	expect(result).toEqual([">foo"]);
});

it("should not split on whitespace in double-quoted string", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements('[title="a b"] foo'));
	expect(result).toEqual(['[title="a b"]', "foo"]);
});

it("should not split on whitespace in single-quoted string", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("[title='a b'] foo"));
	expect(result).toEqual(["[title='a b']", "foo"]);
});

it("should not treat combinators in quoted string as combinators", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements('[title="a > b"] > foo'));
	expect(result).toEqual(['[title="a > b"]', ">foo"]);
});

it("should not split on escaped quote in string", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements('[title="a\\" > b"] foo'));
	expect(result).toEqual(['[title="a\\" > b"]', "foo"]);
});

it("should not split on whitespace or combinators inside parentheses", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements("foo:not(.a > .b) bar:nth-child(2n + 1)"));
	expect(result).toEqual(["foo:not(.a > .b)", "bar:nth-child(2n + 1)"]);
});

it("should not treat ~ in attribute operator as combinator", () => {
	expect.assertions(1);
	const result = Array.from(splitSelectorElements('[class~="a"] foo'));
	expect(result).toEqual(['[class~="a"]', "foo"]);
});
