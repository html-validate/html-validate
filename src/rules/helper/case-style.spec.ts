import { describe, expect, it } from "@jest/globals";
import { applyFix } from "../../autofix";
import { type CaseStyleName, CaseStyle } from "./case-style";

it.each`
	style           | text
	${"lowercase"}  | ${"foo"}
	${"uppercase"}  | ${"FOO"}
	${"camelcase"}  | ${"foo"}
	${"camelcase"}  | ${"fooBar"}
	${"pascalcase"} | ${"Foo"}
	${"pascalcase"} | ${"FooBar"}
`('style "$style" should match "$text"', ({ style, text }) => {
	expect.assertions(1);
	const cs = new CaseStyle(style as CaseStyleName, "test-case");
	expect(cs.match(text)).toBeTruthy();
});

it.each`
	style           | text
	${"lowercase"}  | ${"FOO"}
	${"uppercase"}  | ${"foo"}
	${"camelcase"}  | ${"Foo"}
	${"camelcase"}  | ${"FooBar"}
	${"pascalcase"} | ${"foo"}
	${"pascalcase"} | ${"fooBar"}
`('style "$style" should not match "$text"', ({ style, text }) => {
	expect.assertions(1);
	const cs = new CaseStyle(style as CaseStyleName, "test-case");
	expect(cs.match(text)).toBeFalsy();
});

it("should handle multiple patterns", () => {
	expect.assertions(3);
	const cs = new CaseStyle(["uppercase", "lowercase"], "test-case");
	expect(cs.match("FOO")).toBeTruthy();
	expect(cs.match("bar")).toBeTruthy();
	expect(cs.match("FooBar")).toBeFalsy();
});

it("should throw exception for unknown styles", () => {
	expect.assertions(1);
	expect(() => {
		return new CaseStyle("unknown-style" as unknown as CaseStyleName, "test-case");
	}).toThrow('Invalid style "unknown-style" for test-case rule');
});

it("should throw exception if no styles are set", () => {
	expect.assertions(1);
	expect(() => {
		return new CaseStyle([], "test-case");
	}).toThrow("Missing style for test-case rule");
});

describe("name", () => {
	it("single name should be presented as-is", () => {
		expect.assertions(1);
		const cs = new CaseStyle("uppercase", "test-case");
		expect(cs.name).toBe("uppercase");
	});

	it('two names should be joined by "or"', () => {
		expect.assertions(1);
		const cs = new CaseStyle(["uppercase", "lowercase"], "test-case");
		expect(cs.name).toBe("uppercase or lowercase");
	});

	it("more than two names should be joined by comma followed by or", () => {
		expect.assertions(1);
		const cs = new CaseStyle(["lowercase", "pascalcase", "camelcase"], "test-case");
		expect(cs.name).toBe("lowercase, PascalCase or camelCase");
	});
});

describe("createFixer()", () => {
	const input = "FooBar";
	const location = {
		filename: "mock-file.html",
		line: 1,
		column: 1,
		offset: 0,
		size: input.length,
	};

	it("should create to lowercase fixer", async () => {
		expect.assertions(1);
		const style = new CaseStyle("lowercase", "mock-rule");
		const fixer = style.createFixer(location, input)!;
		const result = await applyFix(location.filename, input, fixer);
		expect(result).toBe("foobar");
	});

	it("should create to uppercase fixer", async () => {
		expect.assertions(1);
		const style = new CaseStyle("uppercase", "mock-rule");
		const source = "FooBar";
		const fixer = style.createFixer(location, source)!;
		const result = await applyFix(location.filename, source, fixer);
		expect(result).toBe("FOOBAR");
	});

	it("should return null for pascalcase", () => {
		expect.assertions(1);
		const style = new CaseStyle("pascalcase", "mock-rule");
		const fixer = style.createFixer(location, input);
		expect(fixer).toBeNull();
	});

	it("should return null for camelcase", () => {
		expect.assertions(1);
		const style = new CaseStyle("camelcase", "mock-rule");
		const fixer = style.createFixer(location, input);
		expect(fixer).toBeNull();
	});

	it("should return null when multiple styles are configured", () => {
		expect.assertions(1);
		const style = new CaseStyle(["lowercase", "uppercase"], "mock-rule");
		const fixer = style.createFixer(location, input);
		expect(fixer).toBeNull();
	});
});
