import { describe, expect, it } from "@jest/globals";
import { type NormalizedPatternAttribute } from "../../meta";
import { findPatternAttribute } from "./find-pattern-attribute";

const dataAttr: NormalizedPatternAttribute = {
	pattern: "data-*",
	regexp: /^data-.+$/i,
};

const ariaAttr: NormalizedPatternAttribute = {
	pattern: "aria-*",
	regexp: /^aria-.+$/i,
};

describe("findPatternAttribute()", () => {
	it("should return the matching entry", () => {
		expect.assertions(1);
		expect(findPatternAttribute("data-foo", [dataAttr, ariaAttr])).toBe(dataAttr);
	});

	it("should return null when no pattern matches", () => {
		expect.assertions(1);
		expect(findPatternAttribute("class", [dataAttr, ariaAttr])).toBeNull();
	});

	it("should return null for empty array", () => {
		expect.assertions(1);
		expect(findPatternAttribute("data-foo", [])).toBeNull();
	});
});
