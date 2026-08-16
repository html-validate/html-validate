import { describe, expect, it } from "@jest/globals";
import { type Plugin } from "../plugin";
import { resolveFlatConfigTransformer } from "./resolve-transformer";

function mockTransform(): [] {
	return [];
}
mockTransform.api = 1;

describe("resolveFlatConfigTransformer()", () => {
	it("should return the transformer as-is when given a function", () => {
		expect.assertions(1);
		const result = resolveFlatConfigTransformer(mockTransform, []);
		expect(result).toBe(mockTransform);
	});

	it("should resolve unnamed transformer from plugin", () => {
		expect.assertions(1);
		const plugins: Plugin[] = [{ name: "mock-plugin", transformer: mockTransform }];
		const result = resolveFlatConfigTransformer("mock-plugin", plugins);
		expect(result).toBe(mockTransform);
	});

	it("should resolve named transformer from plugin", () => {
		expect.assertions(1);
		const plugins: Plugin[] = [{ name: "mock-plugin", transformer: { foobar: mockTransform } }];
		const result = resolveFlatConfigTransformer("mock-plugin:foobar", plugins);
		expect(result).toBe(mockTransform);
	});

	it("should throw when no plugin matches", () => {
		expect.assertions(1);
		expect(() => {
			resolveFlatConfigTransformer("missing-plugin", []);
		}).toThrowErrorMatchingInlineSnapshot(`"No plugin named "missing-plugin" has been loaded"`);
	});

	it("should throw when named plugin is missing", () => {
		expect.assertions(1);
		expect(() => {
			resolveFlatConfigTransformer("missing-plugin:foobar", []);
		}).toThrowErrorMatchingInlineSnapshot(`"No plugin named "missing-plugin" has been loaded"`);
	});
});
