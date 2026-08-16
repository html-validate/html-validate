import { describe, expect, it } from "@jest/globals";
import { type Plugin } from "../plugin";
import { getTransformerFromPlugins } from "./get-transformer-from-plugins";
import { TRANSFORMER_API } from "./transformer-api";

function mockTransform(): [] {
	return [];
}
mockTransform.api = TRANSFORMER_API.VERSION;

describe("getTransformerFromPlugins()", () => {
	it("should return null when name does not match any plugin", () => {
		expect.assertions(1);
		const result = getTransformerFromPlugins("missing-plugin", []);
		expect(result).toBeNull();
	});

	it("should resolve unnamed transformer from plugin", () => {
		expect.assertions(1);
		const plugins: Plugin[] = [{ name: "mock-plugin", transformer: mockTransform }];
		const result = getTransformerFromPlugins("mock-plugin", plugins);
		expect(result).toBe(mockTransform);
	});

	it("should resolve named transformer from plugin", () => {
		expect.assertions(1);
		const plugins: Plugin[] = [{ name: "mock-plugin", transformer: { foobar: mockTransform } }];
		const result = getTransformerFromPlugins("mock-plugin:foobar", plugins);
		expect(result).toBe(mockTransform);
	});

	it("should resolve default named transformer from plugin", () => {
		expect.assertions(1);
		const plugins: Plugin[] = [{ name: "mock-plugin", transformer: { default: mockTransform } }];
		const result = getTransformerFromPlugins("mock-plugin", plugins);
		expect(result).toBe(mockTransform);
	});

	it("should throw when named transformer references missing plugin", () => {
		expect.assertions(1);
		expect(() => {
			getTransformerFromPlugins("missing-plugin:foobar", []);
		}).toThrowErrorMatchingInlineSnapshot(`"No plugin named "missing-plugin" has been loaded"`);
	});

	it("should throw when named transformer does not exist on plugin", () => {
		expect.assertions(1);
		const plugins: Plugin[] = [{ name: "mock-plugin", transformer: { foobar: mockTransform } }];
		expect(() => {
			getTransformerFromPlugins("mock-plugin:missing", plugins);
		}).toThrowErrorMatchingInlineSnapshot(
			`"Plugin "mock-plugin" does not expose a transformer named "missing"."`,
		);
	});

	it("should throw when plugin exposes no transformers", () => {
		expect.assertions(1);
		const plugins: Plugin[] = [{ name: "mock-plugin" }];
		expect(() => {
			getTransformerFromPlugins("mock-plugin:foobar", plugins);
		}).toThrowErrorMatchingInlineSnapshot(`"Plugin does not expose any transformers"`);
	});
});
