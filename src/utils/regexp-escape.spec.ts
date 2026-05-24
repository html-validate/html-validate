/* eslint-disable @typescript-eslint/no-deprecated -- deprecated function should still be tested  */
import { describe, expect, it } from "@jest/globals";
import { regexpEscape } from "./regexp-escape";

it("should return empty string unchanged", () => {
	expect.assertions(1);
	expect(regexpEscape("")).toBe("");
});

describe("first character", () => {
	it("should hex-escape a leading ASCII letter", () => {
		expect.assertions(1);
		/* f = 0x66, remaining chars pass through */
		expect(regexpEscape("foo")).toBe("\\x66oo");
	});

	it("should hex-escape a leading decimal digit", () => {
		expect.assertions(1);
		/* 1 = 0x31 */
		expect(regexpEscape("1foo")).toBe("\\x31foo");
	});
});

describe("syntax characters", () => {
	it.each([
		[".", "\\."],
		["[", "\\["],
		["]", "\\]"],
		["(", "\\("],
		[")", "\\)"],
		["{", "\\{"],
		["}", "\\}"],
		["*", "\\*"],
		["+", "\\+"],
		["?", "\\?"],
		["^", "\\^"],
		["$", "\\$"],
		["|", "\\|"],
		["\\", "\\\\"],
		["/", "\\/"],
	] as const)("should backslash-escape %s", (input, expected) => {
		expect.assertions(1);
		expect(regexpEscape(input)).toBe(expected);
	});
});

describe("control characters", () => {
	it("should escape tab as \\t", () => {
		expect.assertions(1);
		expect(regexpEscape("\t")).toBe("\\t");
	});

	it("should escape newline as \\n", () => {
		expect.assertions(1);
		expect(regexpEscape("\n")).toBe("\\n");
	});

	it("should escape vertical tab as \\v", () => {
		expect.assertions(1);
		expect(regexpEscape("\v")).toBe("\\v");
	});

	it("should escape form feed as \\f", () => {
		expect.assertions(1);
		expect(regexpEscape("\f")).toBe("\\f");
	});

	it("should escape carriage return as \\r", () => {
		expect.assertions(1);
		expect(regexpEscape("\r")).toBe("\\r");
	});
});

describe("other punctuators", () => {
	it("should hex-escape hyphen-minus", () => {
		expect.assertions(1);
		/* - = 0x2d */
		expect(regexpEscape("-")).toBe("\\x2d");
	});

	it("should hex-escape colon", () => {
		expect.assertions(1);
		/* : = 0x3a */
		expect(regexpEscape(":")).toBe("\\x3a");
	});
});

describe("whitespace", () => {
	it("should hex-escape regular space", () => {
		expect.assertions(1);
		/* U+0020 = 0x20 */
		expect(regexpEscape(" ")).toBe("\\x20");
	});

	it("should unicode-escape BOM (U+FEFF)", () => {
		expect.assertions(1);
		expect(regexpEscape("\uFEFF")).toBe("\\ufeff");
	});
});

describe("line terminators", () => {
	it("should unicode-escape line separator (U+2028)", () => {
		expect.assertions(1);
		expect(regexpEscape("\u2028")).toBe("\\u2028");
	});

	it("should unicode-escape paragraph separator (U+2029)", () => {
		expect.assertions(1);
		expect(regexpEscape("\u2029")).toBe("\\u2029");
	});
});

describe("surrogate characters", () => {
	it("should unicode-escape a surrogate character", () => {
		expect.assertions(1);
		expect(regexpEscape("\uD800")).toBe("\\ud800");
	});
});
