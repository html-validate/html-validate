import { isThenable } from "../../utils";
import { Config } from "../config";
import { type ConfigData } from "../config-data";
import recommended from "../presets/recommended";
import { Severity } from "../severity";
import { StaticConfigLoader } from "./static";

class ForcedSyncLoader extends StaticConfigLoader {
	protected override loadFromObject(options: ConfigData): Config {
		const config = Config.fromObject([], options);
		if (isThenable(config)) {
			throw new Error("expected non-thenable result");
		} else {
			return config;
		}
	}
}

class ForcedAsyncLoader extends StaticConfigLoader {
	protected override loadFromObject(options: ConfigData): Promise<Config> {
		return Promise.resolve(Config.fromObject([], options));
	}
}
describe("StaticConfigLoader", () => {
	describe("getConfigFor()", () => {
		it("should use default configuration (sync)", async () => {
			expect.assertions(1);
			const loader = new ForcedSyncLoader();
			const config = await loader.getConfigFor("my-file.html");
			expect(config.getConfigData()).toEqual({
				extends: [],
				elements: ["html5"],
				plugins: [],
				rules: recommended.rules,
				transform: {},
			});
		});

		it("should use default configuration (async)", async () => {
			expect.assertions(1);
			const loader = new ForcedAsyncLoader();
			const config = await loader.getConfigFor("my-file.html");
			expect(config.getConfigData()).toEqual({
				extends: [],
				elements: ["html5"],
				plugins: [],
				rules: recommended.rules,
				transform: {},
			});
		});

		it("should use explicitly passed configuration (sync)", async () => {
			expect.assertions(1);
			const loader = new ForcedSyncLoader({
				rules: {
					a: "error",
				},
			});
			const config = await loader.getConfigFor("my-file.html");
			expect(config.getConfigData()).toEqual(
				expect.objectContaining({
					rules: {
						a: "error",
					},
				}),
			);
		});

		it("should use explicitly passed configuration (async)", async () => {
			expect.assertions(1);
			const loader = new ForcedAsyncLoader({
				rules: {
					a: "error",
				},
			});
			const config = await loader.getConfigFor("my-file.html");
			expect(config.getConfigData()).toEqual(
				expect.objectContaining({
					rules: {
						a: "error",
					},
				}),
			);
		});

		it("should merge global configuration with override if provided (sync)", async () => {
			expect.assertions(1);
			const loader = new ForcedSyncLoader({
				rules: {
					a: "error",
					b: "error",
				},
			});
			const config = await loader.getConfigFor("my-file.html", {
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

		it("should merge global configuration with override if provided (async)", async () => {
			expect.assertions(1);
			const loader = new ForcedAsyncLoader({
				rules: {
					a: "error",
					b: "error",
				},
			});
			const config = await loader.getConfigFor("my-file.html", {
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

		it("should not use global configuration if override config is root (sync)", async () => {
			expect.assertions(1);
			const loader = new ForcedSyncLoader({
				rules: {
					a: "error",
				},
			});
			const config = await loader.getConfigFor("my-file.html", {
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

		it("should not use global configuration if override config is root (async)", async () => {
			expect.assertions(1);
			const loader = new ForcedAsyncLoader({
				rules: {
					a: "error",
				},
			});
			const config = await loader.getConfigFor("my-file.html", {
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
			const config1 = await loader.getConfigFor("-");
			expect(Object.fromEntries(config1.getRules().entries())).toEqual({
				foo: [Severity.ERROR, {}],
			});
			loader.setConfig({
				rules: {
					bar: "error",
				},
			});
			const config2 = await loader.getConfigFor("-");
			expect(Object.fromEntries(config2.getRules().entries())).toEqual({
				bar: [Severity.ERROR, {}],
			});
		});
	});
});
