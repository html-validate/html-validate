import recommended from "../presets/recommended";
import { Severity } from "../severity";
import { StaticConfigLoader } from "./static";

describe("StaticConfigLoader", () => {
	describe("getConfigFor()", () => {
		it("should use default configuration", () => {
			expect.assertions(1);
			const loader = new StaticConfigLoader();
			const config = loader.getConfigFor("my-file.html");
			expect(config.getConfigData()).toEqual({
				extends: [],
				elements: ["html5"],
				plugins: [],
				rules: recommended.rules,
				transform: {},
			});
		});

		it("should use explicitly passed configuration", () => {
			expect.assertions(1);
			const loader = new StaticConfigLoader({
				rules: {
					a: "error",
				},
			});
			const config = loader.getConfigFor("my-file.html");
			expect(config.getConfigData()).toEqual(
				expect.objectContaining({
					rules: {
						a: "error",
					},
				}),
			);
		});

		it("should merge global configuration with override if provided", () => {
			expect.assertions(1);
			const loader = new StaticConfigLoader({
				rules: {
					a: "error",
					b: "error",
				},
			});
			const config = loader.getConfigFor("my-file.html", {
				rules: {
					a: "warn",
					c: "warn",
				},
			});
			expect(config.getConfigData()).toEqual(
				expect.objectContaining({
					rules: {
						a: "warn",
						b: "error",
						c: "warn",
					},
				}),
			);
		});

		it("should not use global configuration if override config is root", () => {
			expect.assertions(1);
			const loader = new StaticConfigLoader({
				rules: {
					a: "error",
				},
			});
			const config = loader.getConfigFor("my-file.html", {
				root: true,
				rules: {
					b: "error",
				},
			});
			expect(config.getConfigData()).toEqual(
				expect.objectContaining({
					root: true,
					rules: {
						b: "error",
					},
				}),
			);
		});
	});

	describe("flushCache()", () => {
		it("should not crash", () => {
			expect.assertions(1);
			const loader = new StaticConfigLoader();
			expect(() => {
				loader.flushCache();
			}).not.toThrow();
		});
	});

	describe("setConfig()", () => {
		it("should set new configuration", async () => {
			expect.assertions(2);
			const loader = new StaticConfigLoader({
				rules: {
					foo: "error",
				},
			});
			const config1 = loader.getConfigFor("-");
			expect(Object.fromEntries(config1.getRules().entries())).toEqual({
				foo: [Severity.ERROR, {}],
			});
			loader.setConfig({
				rules: {
					bar: "error",
				},
			});
			const config2 = loader.getConfigFor("-");
			expect(Object.fromEntries(config2.getRules().entries())).toEqual({
				bar: [Severity.ERROR, {}],
			});
		});
	});
});
