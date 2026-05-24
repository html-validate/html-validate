import { describe, expect, it } from "@jest/globals";
import { type NormalizedPatternAttribute } from "../../meta";
import { isPatternAttribute } from "./is-pattern-attribute";

const dataAttr: NormalizedPatternAttribute = {
	pattern: "data-*",
	regexp: /^data-.+$/i,
};

const ariaAttr: NormalizedPatternAttribute = {
	pattern: "aria-*",
	regexp: /^aria-.+$/i,
};

describe("isPatternAttribute()", () => {
	it("should return true when the attribute name matches a pattern", () => {
		expect.assertions(1);
		expect(isPatternAttribute("data-foo", [dataAttr, ariaAttr])).toBeTruthy();
	});

	it("should return false when no pattern matches", () => {
		expect.assertions(1);
		expect(isPatternAttribute("class", [dataAttr, ariaAttr])).toBeFalsy();
	});

	it("should return false for empty array", () => {
		expect.assertions(1);
		expect(isPatternAttribute("data-foo", [])).toBeFalsy();
	});
});
