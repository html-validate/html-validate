import { Volume } from "memfs/lib/volume";
import * as utils from "../../utils";
import { Config } from "../config";
import { type ConfigData } from "../config-data";
import { type Resolver } from "../resolver";
import { FileSystemConfigLoader } from "./file-system";

declare module "../config-data" {
	interface ConfigData {
		mockFilenames?: string[];
	}
}

let volume: Volume | null;

jest.spyOn(utils, "requireUncached").mockImplementation((_: unknown, moduleName: string) => {
	if (!volume) {
		throw new Error(`Failed to read mocked "${moduleName}", no fs mocked`);
	}
	if (moduleName.endsWith(".json")) {
		return JSON.parse(volume.readFileSync(moduleName, "utf-8") as string);
	} else {
		throw new Error(`Failed to read mocked "${moduleName}", only json files are handled`);
	}
});

class ForcedSyncLoader extends FileSystemConfigLoader {
	protected override loadFromObject(options: ConfigData): Config {
		return Config.fromObject([], options);
	}
}

class ForcedAsyncLoader extends FileSystemConfigLoader {
	protected override loadFromObject(options: ConfigData): Promise<Config> {
		return Promise.resolve(Config.fromObject([], options));
	}
}

beforeEach(() => {
	volume = null;
});

describe("FileSystemConfigLoader", () => {
	it("should load default config if no configuration was passed", async () => {
		expect.assertions(1);
		volume = Volume.fromJSON({});
		const loader = new FileSystemConfigLoader(undefined, { fs: volume });
		expect(await loader._getGlobalConfig()).toEqual({
			extends: [],
			plugins: [],
			rules: {},
			transform: {},
		});
	});

	it("should not load default config if configuration was passed", async () => {
		expect.assertions(1);
		volume = Volume.fromJSON({});
		const loader = new FileSystemConfigLoader({ rules: { foo: "error" } }, { fs: volume });
		expect(await loader._getGlobalConfig()).toEqual({
			extends: [],
			plugins: [],
			rules: {
				foo: "error",
			},
			transform: {},
		});
	});

	it("should use custom resolver", () => {
		expect.assertions(1);
		volume = Volume.fromJSON({});
		const mockResolver: Resolver = {
			name: "mock-resolver",
			resolveConfig() {
				return {};
			},
		};
		const resolveConfig = jest.spyOn(mockResolver, "resolveConfig");
		const loader = new FileSystemConfigLoader(
			[mockResolver],
			{
				extends: ["foo"],
			},
			{ fs: volume },
		);
		loader.getConfigFor("inline");
		expect(resolveConfig).toHaveBeenCalledWith("foo", expect.anything());
	});

	describe("getConfigFor()", () => {
		it("should use global configuration by default (sync)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({});
			/* constructor global config */
			const loader = new ForcedSyncLoader(
				{
					rules: {
						a: "error",
					},
				},
				{ fs: volume },
			);
			const config = await loader.getConfigFor("my-file.html");
			expect(config.getConfigData()).toEqual(
				expect.objectContaining({
					rules: {
						a: "error",
					},
				}),
			);
		});

		it("should use global configuration by default (async)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({});
			/* constructor global config */
			const loader = new ForcedAsyncLoader(
				{
					rules: {
						a: "error",
					},
				},
				{ fs: volume },
			);
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
			volume = Volume.fromJSON({});
			const loader = new ForcedSyncLoader(
				{
					rules: {
						a: "error",
						b: "error",
					},
				},
				{ fs: volume },
			);
			/* override */
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
			volume = Volume.fromJSON({});
			const loader = new ForcedAsyncLoader(
				{
					rules: {
						a: "error",
						b: "error",
					},
				},
				{ fs: volume },
			);
			/* override */
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

		it("should use configuration provided by configuration loader if present (sync)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({
				".htmlvalidate.json": JSON.stringify({
					rules: {
						b: "error",
					},
				} satisfies ConfigData),
			});
			const loader = new ForcedSyncLoader(
				{
					rules: {
						a: "error",
					},
				},
				{ fs: volume },
			);
			const config = await loader.getConfigFor("my-file.html");
			expect(config.getConfigData()).toEqual(
				expect.objectContaining({
					rules: {
						b: "error",
					},
				}),
			);
		});

		it("should use configuration provided by configuration loader if present (async)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({
				".htmlvalidate.json": JSON.stringify({
					rules: {
						b: "error",
					},
				} satisfies ConfigData),
			});
			const loader = new ForcedAsyncLoader(
				{
					rules: {
						a: "error",
					},
				},
				{ fs: volume },
			);
			const config = await loader.getConfigFor("my-file.html");
			expect(config.getConfigData()).toEqual(
				expect.objectContaining({
					rules: {
						b: "error",
					},
				}),
			);
		});

		it("should merge configuration provided by configuration loader with override if provided (sync)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({});
			/* constructor global config */
			const loader = new ForcedSyncLoader(
				{
					rules: {
						a: "error",
					},
				},
				{ fs: volume },
			);
			/* .htmlvalidate.json */
			jest.spyOn(loader, "fromFilename").mockImplementation(() =>
				Config.fromObject([], {
					rules: {
						b: "error",
						c: "error",
					},
				}),
			);
			/* override */
			const config = await loader.getConfigFor("my-file.html", {
				rules: {
					b: "warn",
				},
			});
			expect(config.getConfigData()).toEqual(
				expect.objectContaining({
					rules: {
						b: "warn",
						c: "error",
					},
				}),
			);
		});

		it("should merge configuration provided by configuration loader with override if provided (async)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({});
			/* constructor global config */
			const loader = new ForcedAsyncLoader(
				{
					rules: {
						a: "error",
					},
				},
				{ fs: volume },
			);
			/* .htmlvalidate.json */
			jest.spyOn(loader, "fromFilenameAsync").mockImplementation(() => {
				return Promise.resolve(
					Config.fromObject([], {
						rules: {
							b: "error",
							c: "error",
						},
					}),
				);
			});
			/* override */
			const config = await loader.getConfigFor("my-file.html", {
				rules: {
					b: "warn",
				},
			});
			expect(config.getConfigData()).toEqual(
				expect.objectContaining({
					rules: {
						b: "warn",
						c: "error",
					},
				}),
			);
		});

		it("should not load configuration files if global config is root (sync)", async () => {
			expect.assertions(2);
			volume = Volume.fromJSON({});
			const loader = new ForcedSyncLoader(
				{
					root: true,
				},
				{ fs: volume },
			);
			const fromFilename = jest.spyOn(loader, "fromFilename");
			const config = await loader.getConfigFor("my-file.html");
			expect(fromFilename).not.toHaveBeenCalled();
			expect(config.getConfigData()).toEqual(
				expect.objectContaining({
					root: true,
				}),
			);
		});

		it("should not load configuration files if global config is root (async)", async () => {
			expect.assertions(2);
			volume = Volume.fromJSON({});
			const loader = new ForcedAsyncLoader(
				{
					root: true,
				},
				{ fs: volume },
			);
			const fromFilename = jest.spyOn(loader, "fromFilename");
			const config = await loader.getConfigFor("my-file.html");
			expect(fromFilename).not.toHaveBeenCalled();
			expect(config.getConfigData()).toEqual(
				expect.objectContaining({
					root: true,
				}),
			);
		});

		it("should merge global with override when global is root (sync)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({});
			const loader = new ForcedSyncLoader(
				{
					root: true,
					rules: {
						a: "error",
					},
				},
				{ fs: volume },
			);
			const config = await loader.getConfigFor("my-file.html", {
				rules: {
					a: "off",
				},
			});
			expect(config.getConfigData()).toEqual(
				expect.objectContaining({
					root: true,
					rules: {
						a: "off",
					},
				}),
			);
		});

		it("should merge global with override when global is root (async)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({});
			const loader = new ForcedAsyncLoader(
				{
					root: true,
					rules: {
						a: "error",
					},
				},
				{ fs: volume },
			);
			const config = await loader.getConfigFor("my-file.html", {
				rules: {
					a: "off",
				},
			});
			expect(config.getConfigData()).toEqual(
				expect.objectContaining({
					root: true,
					rules: {
						a: "off",
					},
				}),
			);
		});

		it("should not load global configuration files if override config is root (sync)", async () => {
			expect.assertions(2);
			volume = Volume.fromJSON({});
			const loader = new ForcedSyncLoader(
				{
					rules: {
						a: "error",
					},
				},
				{ fs: volume },
			);
			const fromFilename = jest.spyOn(loader, "fromFilename");
			const config = await loader.getConfigFor("my-file.html", {
				root: true,
				rules: {
					b: "error",
				},
			});
			expect(fromFilename).not.toHaveBeenCalled();
			expect(config.getConfigData()).toEqual(
				expect.objectContaining({
					root: true,
					rules: {
						b: "error",
					},
				}),
			);
		});

		it("should not load global configuration files if override config is root (async)", async () => {
			expect.assertions(2);
			volume = Volume.fromJSON({});
			const loader = new ForcedAsyncLoader(
				{
					rules: {
						a: "error",
					},
				},
				{ fs: volume },
			);
			const fromFilename = jest.spyOn(loader, "fromFilename");
			const config = await loader.getConfigFor("my-file.html", {
				root: true,
				rules: {
					b: "error",
				},
			});
			expect(fromFilename).not.toHaveBeenCalled();
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

	describe("fromFilename()", () => {
		it("should load configuration (sync)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({
				"/path/to/.htmlvalidate.json": JSON.stringify({
					rules: {
						foo: "error",
					},
				} satisfies ConfigData),
			});
			const loader = new FileSystemConfigLoader(undefined, { fs: volume });
			const config = await loader.fromFilename("/path/to/target.html");
			expect(config?.get()).toEqual({
				elements: undefined,
				extends: [],
				plugins: [],
				transform: {},
				rules: {
					foo: "error",
				},
			});
		});

		it("should load configuration (async)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({
				"/path/to/.htmlvalidate.json": JSON.stringify({
					rules: {
						foo: "error",
					},
				} satisfies ConfigData),
			});
			const loader = new FileSystemConfigLoader(undefined, { fs: volume });
			const config = await loader.fromFilenameAsync("/path/to/target.html");
			expect(config?.get()).toEqual({
				elements: undefined,
				extends: [],
				plugins: [],
				transform: {},
				rules: {
					foo: "error",
				},
			});
		});

		it("should load configuration from parent directory (sync)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({
				"/path/.htmlvalidate.json": JSON.stringify({
					rules: {
						foo: "error",
					},
				} satisfies ConfigData),
			});
			const loader = new FileSystemConfigLoader(undefined, { fs: volume });
			const config = await loader.fromFilename("/path/to/target.html");
			expect(config?.get()).toEqual({
				elements: undefined,
				extends: [],
				plugins: [],
				transform: {},
				rules: {
					foo: "error",
				},
			});
		});

		it("should load configuration from parent directory (async)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({
				"/path/.htmlvalidate.json": JSON.stringify({
					rules: {
						foo: "error",
					},
				} satisfies ConfigData),
			});
			const loader = new FileSystemConfigLoader(undefined, { fs: volume });
			const config = await loader.fromFilenameAsync("/path/to/target.html");
			expect(config?.get()).toEqual({
				elements: undefined,
				extends: [],
				plugins: [],
				transform: {},
				rules: {
					foo: "error",
				},
			});
		});

		it("should load configuration from multiple files (sync)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({
				"/.htmlvalidate.json": JSON.stringify({
					rules: {
						a: "error",
					},
				} satisfies ConfigData),
				"/path/.htmlvalidate.json": JSON.stringify({
					rules: {
						a: "warn",
						b: "error",
						c: "warn",
					},
				} satisfies ConfigData),
				"/path/to/.htmlvalidate.json": JSON.stringify({
					rules: {
						c: "error",
					},
				} satisfies ConfigData),
			});
			const loader = new FileSystemConfigLoader(undefined, { fs: volume });
			const config = await loader.fromFilename("/path/to/target.html");
			expect(config?.get()).toEqual({
				elements: undefined,
				extends: [],
				plugins: [],
				transform: {},
				rules: {
					a: "warn" /* warn should have precedence over topmost directory */,
					b: "error",
					c: "error" /* error should have precedence over parent directory */,
				},
			});
		});

		it("should load configuration from multiple files (async)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({
				"/.htmlvalidate.json": JSON.stringify({
					rules: {
						a: "error",
					},
				} satisfies ConfigData),
				"/path/.htmlvalidate.json": JSON.stringify({
					rules: {
						a: "warn",
						b: "error",
						c: "warn",
					},
				} satisfies ConfigData),
				"/path/to/.htmlvalidate.json": JSON.stringify({
					rules: {
						c: "error",
					},
				} satisfies ConfigData),
			});
			const loader = new FileSystemConfigLoader(undefined, { fs: volume });
			const config = await loader.fromFilenameAsync("/path/to/target.html");
			expect(config?.get()).toEqual({
				elements: undefined,
				extends: [],
				plugins: [],
				transform: {},
				rules: {
					a: "warn" /* warn should have precedence over topmost directory */,
					b: "error",
					c: "error" /* error should have precedence over parent directory */,
				},
			});
		});

		it("should stop searching when root is found (sync)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({
				"/project/.htmlvalidate.json": JSON.stringify({
					root: true,
					rules: {
						a: "error",
					},
				} satisfies ConfigData),
				"/project/root/.htmlvalidate.json": JSON.stringify({
					root: true,
					rules: {
						b: "error",
					},
				} satisfies ConfigData),
				"/project/root/src/.htmlvalidate.json": JSON.stringify({
					rules: {
						c: "error",
					},
				} satisfies ConfigData),
			});
			const loader = new FileSystemConfigLoader(undefined, { fs: volume });
			const config = await loader.fromFilename("/project/root/src/target.html");
			expect(config?.get()).toEqual({
				root: true,
				elements: undefined,
				extends: [],
				plugins: [],
				transform: {},
				rules: {
					/* a should not be present */
					b: "error",
					c: "error",
				},
			});
		});

		it("should stop searching when root is found (async)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({
				"/project/.htmlvalidate.json": JSON.stringify({
					root: true,
					rules: {
						a: "error",
					},
				} satisfies ConfigData),
				"/project/root/.htmlvalidate.json": JSON.stringify({
					root: true,
					rules: {
						b: "error",
					},
				} satisfies ConfigData),
				"/project/root/src/.htmlvalidate.json": JSON.stringify({
					rules: {
						c: "error",
					},
				} satisfies ConfigData),
			});
			const loader = new FileSystemConfigLoader(undefined, { fs: volume });
			const config = await loader.fromFilenameAsync("/project/root/src/target.html");
			expect(config?.get()).toEqual({
				root: true,
				elements: undefined,
				extends: [],
				plugins: [],
				transform: {},
				rules: {
					/* a should not be present */
					b: "error",
					c: "error",
				},
			});
		});

		it("should return null for inline sources (sync)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({});
			const loader = new FileSystemConfigLoader(undefined, { fs: volume });
			const config = await loader.fromFilename("inline");
			expect(config).toBeNull();
		});

		it("should return null for inline sources (async)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({});
			const loader = new FileSystemConfigLoader(undefined, { fs: volume });
			const config = await loader.fromFilenameAsync("inline");
			expect(config).toBeNull();
		});

		it("should cache results (sync)", async () => {
			expect.assertions(3);
			volume = Volume.fromJSON({
				"/path/.htmlvalidate.json": JSON.stringify({
					rules: {
						foo: "error",
					},
				} satisfies ConfigData),
				"/path/to/.htmlvalidate.json": JSON.stringify({
					rules: {
						bar: "error",
					},
				} satisfies ConfigData),
			});
			const loader = new FileSystemConfigLoader(undefined, { fs: volume });
			const cache = loader._getInternalCache();
			expect(cache.has("/path/to/target.html")).toBeFalsy();
			await loader.fromFilename("/path/to/target.html");
			expect(cache.has("/path/to/target.html")).toBeTruthy();
			expect(cache.get("/path/to/target.html")?.get()).toEqual({
				elements: undefined,
				extends: [],
				plugins: [],
				transform: {},
				rules: {
					foo: "error",
					bar: "error",
				},
			});
		});

		it("should cache results (async)", async () => {
			expect.assertions(3);
			volume = Volume.fromJSON({
				"/path/.htmlvalidate.json": JSON.stringify({
					rules: {
						foo: "error",
					},
				} satisfies ConfigData),
				"/path/to/.htmlvalidate.json": JSON.stringify({
					rules: {
						bar: "error",
					},
				} satisfies ConfigData),
			});
			const loader = new FileSystemConfigLoader(undefined, { fs: volume });
			const cache = loader._getInternalCache();
			expect(cache.has("/path/to/target.html")).toBeFalsy();
			await loader.fromFilenameAsync("/path/to/target.html");
			expect(cache.has("/path/to/target.html")).toBeTruthy();
			expect(cache.get("/path/to/target.html")?.get()).toEqual({
				elements: undefined,
				extends: [],
				plugins: [],
				transform: {},
				rules: {
					foo: "error",
					bar: "error",
				},
			});
		});

		it("should load from cache if present (sync)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({});
			const loader = new FileSystemConfigLoader(undefined, { fs: volume });
			const cache = loader._getInternalCache();
			const configData: ConfigData = {
				rules: {
					cached: "error",
				},
			};
			cache.set("/path/to/target.html", Config.fromObject([], configData));
			const config = await loader.fromFilename("/path/to/target.html");
			expect(config?.get()).toEqual({
				elements: undefined,
				extends: [],
				plugins: [],
				transform: {},
				rules: {
					cached: "error",
				},
			});
		});

		it("should load from cache if present (async)", async () => {
			expect.assertions(1);
			volume = Volume.fromJSON({});
			const loader = new FileSystemConfigLoader(undefined, { fs: volume });
			const cache = loader._getInternalCache();
			const configData: ConfigData = {
				rules: {
					cached: "error",
				},
			};
			cache.set("/path/to/target.html", Config.fromObject([], configData));
			const config = await loader.fromFilenameAsync("/path/to/target.html");
			expect(config?.get()).toEqual({
				elements: undefined,
				extends: [],
				plugins: [],
				transform: {},
				rules: {
					cached: "error",
				},
			});
		});
	});

	describe("flushCache()", () => {
		let loader: FileSystemConfigLoader;

		beforeEach(() => {
			loader = new FileSystemConfigLoader();
		});

		it("should clear cache", () => {
			expect.assertions(2);
			const cache = loader._getInternalCache();
			cache.set("foo", null);
			cache.set("bar", null);
			cache.set("baz", null);
			expect(cache.size).toBe(3);
			loader.flushCache();
			expect(cache.size).toBe(0);
		});

		it("should clear single filename", () => {
			expect.assertions(5);
			const cache = loader._getInternalCache();
			cache.set("foo", null);
			cache.set("bar", null);
			cache.set("baz", null);
			expect(cache.size).toBe(3);
			loader.flushCache("foo");
			expect(cache.size).toBe(2);
			expect(cache.has("foo")).toBeFalsy();
			expect(cache.has("bar")).toBeTruthy();
			expect(cache.has("baz")).toBeTruthy();
		});
	});
});
