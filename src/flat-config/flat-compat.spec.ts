import { describe, expect, it } from "@jest/globals";
import { staticResolver } from "../config/resolver";
import { type Source } from "../context";
import { type Plugin } from "../plugin";
import { type Transformer, TRANSFORMER_API } from "../transform";
import { FlatCompat } from "./flat-compat";

function createTransformer(): Transformer {
	const transformer: Transformer = function transform(source: Source) {
		return source;
	};
	transformer.api = TRANSFORMER_API.VERSION;
	return transformer;
}

describe("FlatCompat", () => {
	describe("config()", () => {
		it("should return an empty object when data is undefined", async () => {
			expect.assertions(1);
			const compat = new FlatCompat([]);
			const result = await compat.config(undefined);
			expect(result).toEqual({});
		});

		it("should pass through inline rules", async () => {
			expect.assertions(1);
			const compat = new FlatCompat([]);
			const result = await compat.config({
				rules: {
					"no-self-closing": "error",
				},
			});
			expect(result.rules).toEqual({
				"no-self-closing": "error",
			});
		});

		it("should pass through inline elements", async () => {
			expect.assertions(1);
			const compat = new FlatCompat([]);
			const result = await compat.config({
				elements: [{ "my-element": {} }],
			});
			expect(result.elements).toEqual([{ "my-element": {} }]);
		});

		it("should resolve string elements references", async () => {
			expect.assertions(1);
			const resolver = staticResolver({
				elements: { "my-elements": { "my-element": {} } },
			});
			const compat = new FlatCompat([resolver]);
			const result = await compat.config({
				elements: ["my-elements"],
			});
			expect(result.elements).toEqual([{ "my-element": {} }]);
		});

		it("should resolve bundled string elements references", async () => {
			expect.assertions(1);
			const compat = new FlatCompat([]);
			const result = await compat.config({
				elements: ["html5"],
			});
			expect(result.elements).toHaveLength(1);
		});

		it("should pass through inline plugins", async () => {
			expect.assertions(1);
			const plugin: Plugin = { name: "my-plugin" };
			const compat = new FlatCompat([]);
			const result = await compat.config({
				plugins: [plugin],
			});
			expect(result.plugins).toEqual([expect.objectContaining({ name: "my-plugin" })]);
		});

		it("should resolve string plugin references", async () => {
			expect.assertions(1);
			const plugin: Plugin = { name: "my-plugin" };
			const resolver = staticResolver({
				plugins: { "my-plugin": plugin },
			});
			const compat = new FlatCompat([resolver]);
			const result = await compat.config({
				plugins: ["my-plugin"],
			});
			expect(result.plugins).toEqual([expect.objectContaining({ name: "my-plugin" })]);
		});

		it("should pass through inline transform functions", async () => {
			expect.assertions(1);
			const transformer = createTransformer();
			const compat = new FlatCompat([]);
			const result = await compat.config({
				transform: {
					"\\.foo$": transformer,
				},
			});
			expect(result.transform).toEqual({ "\\.foo$": transformer });
		});

		it("should resolve string transform references", async () => {
			expect.assertions(1);
			const transformer = createTransformer();
			const resolver = staticResolver({
				transformers: { "my-transform": transformer },
			});
			const compat = new FlatCompat([resolver]);
			const result = await compat.config({
				transform: {
					"\\.foo$": "my-transform",
				},
			});
			expect(result.transform).toEqual({ "\\.foo$": transformer });
		});

		it("should resolve extends and merge rules", async () => {
			expect.assertions(1);
			const resolver = staticResolver({
				configs: {
					"my-preset": {
						rules: {
							"no-self-closing": "error",
							deprecated: "warn",
						},
					},
				},
			});
			const compat = new FlatCompat([resolver]);
			const result = await compat.config({
				extends: ["my-preset"],
				rules: {
					"no-self-closing": "warn",
				},
			});
			expect(result.rules).toEqual({
				"no-self-closing": "warn",
				deprecated: "warn",
			});
		});

		it("should silently drop the root flag", async () => {
			expect.assertions(1);
			const compat = new FlatCompat([]);
			const result = await compat.config({
				root: true,
				rules: {
					"no-self-closing": "error",
				},
			});
			expect(result).not.toHaveProperty("root");
		});

		it("should throw when a string element reference cannot be resolved", async () => {
			expect.assertions(1);
			const compat = new FlatCompat([]);
			await expect(compat.config({ elements: ["missing-elements"] })).rejects.toThrow(
				/Failed to load elements from "missing-elements"/,
			);
		});

		it("should throw when a string plugin reference cannot be resolved", async () => {
			expect.assertions(1);
			const compat = new FlatCompat([]);
			await expect(compat.config({ plugins: ["missing-plugin"] })).rejects.toThrow(
				/Failed to load plugin "missing-plugin"/,
			);
		});

		it("should throw when a string transform reference cannot be resolved", async () => {
			expect.assertions(1);
			const compat = new FlatCompat([]);
			await expect(
				compat.config({ transform: { "\\.foo$": "missing-transform" } }),
			).rejects.toThrow();
		});

		it("should throw a schema validation error for invalid configuration", async () => {
			expect.assertions(1);
			const invalid = { rules: { "no-self-closing": "invalid-severity" } } as never;
			const compat = new FlatCompat([]);
			await expect(compat.config(invalid)).rejects.toThrow();
		});
	});

	describe("extend()", () => {
		it("should resolve a single preset by name", async () => {
			expect.assertions(1);
			const resolver = staticResolver({
				configs: {
					"my-preset": {
						rules: {
							"no-self-closing": "error",
						},
					},
				},
			});
			const compat = new FlatCompat([resolver]);
			const result = await compat.extend("my-preset");
			expect(result.rules).toEqual({
				"no-self-closing": "error",
			});
		});

		it("should resolve and merge multiple presets by name (last wins)", async () => {
			expect.assertions(1);
			const resolver = staticResolver({
				configs: {
					"preset-a": {
						rules: {
							"no-self-closing": "error",
							deprecated: "warn",
						},
					},
					"preset-b": {
						rules: {
							"no-self-closing": "warn",
						},
					},
				},
			});
			const compat = new FlatCompat([resolver]);
			const result = await compat.extend("preset-a", "preset-b");
			expect(result.rules).toEqual({
				"no-self-closing": "warn",
				deprecated: "warn",
			});
		});

		it("should resolve builtin presets", async () => {
			expect.assertions(1);
			const compat = new FlatCompat([]);
			const result = await compat.extend("html-validate:recommended");
			expect(result.rules).not.toEqual({});
		});

		it("should throw when a preset cannot be resolved", async () => {
			expect.assertions(1);
			const compat = new FlatCompat([]);
			await expect(compat.extend("missing-preset")).rejects.toThrow();
		});
	});
});
