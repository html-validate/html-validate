import { describe, expect, it } from "@jest/globals";
import { computeHash } from "./compute-hash";

describe("computeHash()", () => {
	it("should return a number", () => {
		expect.assertions(1);
		expect(typeof computeHash("foo")).toBe("number");
	});

	it("should return different hashes for different strings", () => {
		expect.assertions(1);
		expect(computeHash("foo")).not.toBe(computeHash("bar"));
	});

	it("should return the same hash for the same string", () => {
		expect.assertions(1);
		expect(computeHash("foo")).toBe(computeHash("foo"));
	});

	it("should handle strings with characters above U+FFFF (e.g. emoji)", () => {
		expect.assertions(2);
		/* emoji are encoded as surrogate pairs (code point > 0xFFFF), covering
		 * the `i += ch > 0xffff ? 2 : 1` branch */
		const result = computeHash("😀");
		expect(typeof result).toBe("number");
		expect(computeHash("😀")).toBe(result);
	});

	it("should handle empty string", () => {
		expect.assertions(1);
		expect(typeof computeHash("")).toBe("number");
	});
});
