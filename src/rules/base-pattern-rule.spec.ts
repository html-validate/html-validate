import Ajv from "ajv";
import { type NamedPattern, type ParsedPattern, patternNamesValues } from "../pattern";
import { ajvRegexpKeyword } from "../schema/keywords";
import { BasePatternRule, validateAllowedPatterns } from "./base-pattern-rule";

const allowedPatterns = new Set(patternNamesValues);

const ajv = new Ajv({ strict: true, strictTuples: true, strictTypes: true });
ajv.addKeyword(ajvRegexpKeyword);

class MockRule extends BasePatternRule {
	public getPatterns(): ParsedPattern[] {
		return this.patterns;
	}

	public setup(): void {
		/* mock implementation */
	}
}

describe("BasePatternRule", () => {
	it("should handle named pattern", () => {
		expect.assertions(4);
		const validator = ajv.compile({
			type: "object",
			properties: BasePatternRule.schema(),
		});
		const config = { pattern: "kebabcase" } as const;
		expect(validator(config)).toBeTruthy();
		expect(validator.errors).toBeNull();

		const rule = new MockRule({
			ruleId: "mock-rule",
			attr: "test-attr",
			options: config,
			allowedPatterns,
		});
		const patterns = rule.getPatterns();
		expect(patterns).toHaveLength(1);
		expect(patterns[0].description).toBe("kebabcase");
	});

	it("should handle custom string pattern", () => {
		expect.assertions(5);
		const validator = ajv.compile({
			type: "object",
			properties: BasePatternRule.schema(),
		});
		const config = { pattern: "/^[a-z]+$/" } as const;
		expect(validator(config)).toBeTruthy();
		expect(validator.errors).toBeNull();

		const rule = new MockRule({
			ruleId: "mock-rule",
			attr: "test-attr",
			options: config,
			allowedPatterns,
		});
		const patterns = rule.getPatterns();
		expect(patterns).toHaveLength(1);
		expect(patterns[0].description).toBe("/^[a-z]+$/");
		expect(patterns[0].regexp.test("abc")).toBeTruthy();
	});

	it("should handle RegExp object as pattern", () => {
		expect.assertions(6);
		const validator = ajv.compile({
			type: "object",
			properties: BasePatternRule.schema(),
		});
		const regexp = /^[a-z][a-z0-9-]*$/;
		const config = { pattern: regexp } as const;
		expect(validator(config)).toBeTruthy();
		expect(validator.errors).toBeNull();

		const rule = new MockRule({
			ruleId: "mock-rule",
			attr: "test-attr",
			options: config,
			allowedPatterns,
		});
		const patterns = rule.getPatterns();
		expect(patterns).toHaveLength(1);
		expect(patterns[0].description).toBe("/^[a-z][a-z0-9-]*$/");
		expect(patterns[0].regexp).toBe(regexp);
		expect(patterns[0].regexp.test("foo-bar")).toBeTruthy();
	});

	it("should handle array of named patterns", () => {
		expect.assertions(5);
		const validator = ajv.compile({
			type: "object",
			properties: BasePatternRule.schema(),
		});
		const config = { pattern: ["kebabcase", "camelcase"] } as const;
		expect(validator(config)).toBeTruthy();
		expect(validator.errors).toBeNull();

		const rule = new MockRule({
			ruleId: "mock-rule",
			attr: "test-attr",
			options: config,
			allowedPatterns,
		});
		const patterns = rule.getPatterns();
		expect(patterns).toHaveLength(2);
		expect(patterns[0].description).toBe("kebabcase");
		expect(patterns[1].description).toBe("camelcase");
	});

	it("should handle array of custom string patterns", () => {
		expect.assertions(6);
		const validator = ajv.compile({
			type: "object",
			properties: BasePatternRule.schema(),
		});
		const config = { pattern: ["/^[a-z]+$/", "/^[A-Z]+$/"] } as const;
		expect(validator(config)).toBeTruthy();
		expect(validator.errors).toBeNull();

		const rule = new MockRule({
			ruleId: "mock-rule",
			attr: "test-attr",
			options: config,
			allowedPatterns: new Set(),
		});
		const patterns = rule.getPatterns();
		expect(patterns).toHaveLength(2);
		expect(patterns[0].description).toBe("/^[a-z]+$/");
		expect(patterns[0].regexp.test("abc")).toBeTruthy();
		expect(patterns[1].regexp.test("ABC")).toBeTruthy();
	});

	it("should handle array of RegExp objects", () => {
		expect.assertions(7);
		const validator = ajv.compile({
			type: "object",
			properties: BasePatternRule.schema(),
		});
		const regexp1 = /^[a-z]+$/;
		const regexp2 = /^[A-Z]+$/;
		const config = { pattern: [regexp1, regexp2] } as const;
		expect(validator(config)).toBeTruthy();
		expect(validator.errors).toBeNull();

		const rule = new MockRule({
			ruleId: "mock-rule",
			attr: "test-attr",
			options: config,
			allowedPatterns: new Set(),
		});
		const patterns = rule.getPatterns();
		expect(patterns).toHaveLength(2);
		expect(patterns[0].regexp).toBe(regexp1);
		expect(patterns[1].regexp).toBe(regexp2);
		expect(patterns[0].description).toBe("/^[a-z]+$/");
		expect(patterns[1].description).toBe("/^[A-Z]+$/");
	});

	it("should handle mixed array of strings and RegExp objects", () => {
		expect.assertions(7);
		const validator = ajv.compile({
			type: "object",
			properties: BasePatternRule.schema(),
		});
		const regexp = /^\d+$/;
		const config = { pattern: ["kebabcase", "/^[a-z]+$/", regexp] } as const;
		expect(validator(config)).toBeTruthy();
		expect(validator.errors).toBeNull();

		const rule = new MockRule({
			ruleId: "mock-rule",
			attr: "test-attr",
			options: config,
			allowedPatterns,
		});
		const patterns = rule.getPatterns();
		expect(patterns).toHaveLength(3);
		expect(patterns[0].description).toBe("kebabcase");
		expect(patterns[1].description).toBe("/^[a-z]+$/");
		expect(patterns[2].regexp).toBe(regexp);
		expect(patterns[2].description).toBe("/^\\d+$/");
	});

	it("should reject non-string, non-RegExp values", () => {
		expect.assertions(2);
		const validator = ajv.compile({
			type: "object",
			properties: BasePatternRule.schema(),
		});
		const config = { pattern: 123 } as const;
		expect(validator(config)).toBeFalsy();
		expect(validator.errors).not.toBeNull();
	});

	it("should reject array with non-string, non-RegExp values", () => {
		expect.assertions(2);
		const validator = ajv.compile({
			type: "object",
			properties: BasePatternRule.schema(),
		});
		const config = { pattern: ["kebabcase", 123] } as const;
		expect(validator(config)).toBeFalsy();
		expect(validator.errors).not.toBeNull();
	});
});

describe("validateAllowedPatterns", () => {
	it("should not throw when using only allowed named patterns", () => {
		expect.assertions(1);
		const patterns = ["kebabcase", "camelcase"] as const;
		const allowedPatterns = new Set<NamedPattern>(["kebabcase", "camelcase", "snakecase"]);
		expect(() => {
			validateAllowedPatterns(patterns, allowedPatterns, "mock-rule");
		}).not.toThrow();
	});

	it("should not throw when using custom string patterns", () => {
		expect.assertions(1);
		const patterns = ["/^[a-z]+$/", "/^[A-Z]+$/"] as const;
		const allowedPatterns = new Set<NamedPattern>(["kebabcase"]);
		expect(() => {
			validateAllowedPatterns(patterns, allowedPatterns, "mock-rule");
		}).not.toThrow();
	});

	it("should not throw when using RegExp objects", () => {
		expect.assertions(1);
		const patterns = [/^[a-z]+$/, /^[A-Z]+$/] as const;
		const allowedPatterns = new Set<NamedPattern>(["kebabcase"]);
		expect(() => {
			validateAllowedPatterns(patterns, allowedPatterns, "mock-rule");
		}).not.toThrow();
	});

	it("should not throw when mixing allowed named patterns with custom patterns", () => {
		expect.assertions(1);
		const patterns = ["kebabcase", "/^[a-z]+$/", /^\d+$/] as const;
		const allowedPatterns = new Set<NamedPattern>(["kebabcase", "camelcase"]);
		expect(() => {
			validateAllowedPatterns(patterns, allowedPatterns, "mock-rule");
		}).not.toThrow();
	});

	it("should throw when using a single disallowed named pattern", () => {
		expect.assertions(1);
		const patterns = ["snakecase"] as const;
		const allowedPatterns = new Set<NamedPattern>(["kebabcase", "camelcase"]);
		expect(() => {
			validateAllowedPatterns(patterns, allowedPatterns, "mock-rule");
		}).toThrowErrorMatchingInlineSnapshot(
			`"Pattern "snakecase" cannot be used with "mock-rule". Allowed patterns: "kebabcase" and "camelcase""`,
		);
	});

	it("should throw when using multiple disallowed named patterns", () => {
		expect.assertions(1);
		const patterns = ["snakecase", "bem"] as const;
		const allowedPatterns = new Set<NamedPattern>(["kebabcase", "camelcase"]);
		expect(() => {
			validateAllowedPatterns(patterns, allowedPatterns, "mock-rule");
		}).toThrowErrorMatchingInlineSnapshot(
			`"Pattern "snakecase" and "bem" cannot be used with "mock-rule". Allowed patterns: "kebabcase" and "camelcase""`,
		);
	});

	it("should throw when mixing allowed and disallowed named patterns", () => {
		expect.assertions(1);
		const patterns = ["kebabcase", "snakecase", "/^[a-z]+$/"] as const;
		const allowedPatterns = new Set<NamedPattern>(["kebabcase", "camelcase"]);
		expect(() => {
			validateAllowedPatterns(patterns, allowedPatterns, "mock-rule");
		}).toThrowErrorMatchingInlineSnapshot(
			`"Pattern "snakecase" cannot be used with "mock-rule". Allowed patterns: "kebabcase" and "camelcase""`,
		);
	});

	it("should include rule ID in error message", () => {
		expect.assertions(1);
		const patterns = ["bem"] as const;
		const allowedPatterns = new Set<NamedPattern>(["kebabcase"]);
		expect(() => {
			validateAllowedPatterns(patterns, allowedPatterns, "my-custom-rule");
		}).toThrowErrorMatchingInlineSnapshot(
			`"Pattern "bem" cannot be used with "my-custom-rule". Allowed patterns: "kebabcase""`,
		);
	});

	it("should handle single allowed pattern in error message", () => {
		expect.assertions(1);
		const patterns = ["camelcase"] as const;
		const allowedPatterns = new Set<NamedPattern>(["kebabcase"]);
		expect(() => {
			validateAllowedPatterns(patterns, allowedPatterns, "mock-rule");
		}).toThrowErrorMatchingInlineSnapshot(
			`"Pattern "camelcase" cannot be used with "mock-rule". Allowed patterns: "kebabcase""`,
		);
	});

	it("should handle three or more allowed patterns in error message", () => {
		expect.assertions(1);
		const patterns = ["bem"] as const;
		const allowedPatterns = new Set<NamedPattern>(["kebabcase", "camelcase", "snakecase"]);
		expect(() => {
			validateAllowedPatterns(patterns, allowedPatterns, "mock-rule");
		}).toThrowErrorMatchingInlineSnapshot(
			`"Pattern "bem" cannot be used with "mock-rule". Allowed patterns: "kebabcase", "camelcase" and "snakecase""`,
		);
	});
});
