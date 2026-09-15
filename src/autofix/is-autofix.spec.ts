import { describe, expect, it } from "@jest/globals";
import { createAutofix } from "./create-autofix";
import { isAutofix } from "./is-autofix";

describe("isAutofix()", () => {
	it("should return true for autofix instance", () => {
		expect.assertions(1);
		const value = createAutofix("", () => {
			/* do nothing */
		});
		expect(isAutofix(value)).toBeTruthy();
	});

	it("should return false for null and undefined", () => {
		expect.assertions(2);
		expect(isAutofix(null)).toBeFalsy();
		expect(isAutofix(undefined)).toBeFalsy();
	});

	it("should return false for strings", () => {
		expect.assertions(2);
		expect(isAutofix("")).toBeFalsy();
		expect(isAutofix("foo")).toBeFalsy();
	});

	it("should return false for numbers", () => {
		expect.assertions(2);
		expect(isAutofix(0)).toBeFalsy();
		expect(isAutofix(42)).toBeFalsy();
	});

	it("should return false for functions", () => {
		expect.assertions(2);
		expect(
			isAutofix(() => {
				/* do nothing */
			}),
		).toBeFalsy();
		expect(
			isAutofix(function () {
				/* do nothing */
			}),
		).toBeFalsy();
	});

	it("should return false for objects", () => {
		expect.assertions(2);
		expect(isAutofix({})).toBeFalsy();
		expect(isAutofix(/foo/)).toBeFalsy();
	});
});
