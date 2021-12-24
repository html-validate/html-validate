import fs from "fs";
import path from "path";
import glob from "glob";
import { Config } from "../config";
import { ConfigData, RuleConfig } from "../config-data";
import { ConfigFactory } from "../config-loader";
import { FileSystemConfigLoader } from "./file-system";

declare module "../config-data" {
	interface ConfigData {
		mockFilenames?: string[];
	}
}

jest.mock("ajv", () => {
	class MockAjv {
		public compile(): () => boolean {
			/* always valid */
			return () => true;
		}
		public getSchema(): undefined {
			return undefined;
		}
		public addMetaSchema(): void {
			/* do nothing */
		}
		public addKeyword(): void {
			/* do nothing */
		}
	}
	return MockAjv;
});

class MockConfigFactory {
	public static defaultConfig(): Config {
		return Config.defaultConfig();
	}

	public static empty(): Config {
		return Config.empty();
	}

	public static fromObject(options: ConfigData, filename: string | null = null): Config {
		return Config.fromObject(options, filename);
	}

	public static fromFile(filename: string): Config {
		return Config.fromObject({
			/* set root to true for if the last directory name is literal "root" */
			root: path.basename(path.dirname(filename)) === "root",

			mockFilenames: [filename],
		});
	}
}

class ExposedFileSystemConfigLoader extends FileSystemConfigLoader {
	public constructor(config?: ConfigData, configFactory: ConfigFactory = MockConfigFactory) {
		super(config, configFactory);
	}

	public mockGetGlobalConfig(): Config {
		return this.globalConfig;
	}

	public mockGetInternalCache(): Map<string, Config | null> {
		return this.cache;
	}
}

describe("FileSystemConfigLoader", () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("should load default config if no configuration was passed", () => {
		expect.assertions(1);
		const loader = new ExposedFileSystemConfigLoader();
		expect(loader.mockGetGlobalConfig().get()).toEqual({
			plugins: [],
			rules: {},
			transform: {},
		});
	});

	it("should not load default config if configuration was passed", () => {
		expect.assertions(1);
		const loader = new ExposedFileSystemConfigLoader({ rules: { foo: "error" } });
		expect(loader.mockGetGlobalConfig().get()).toEqual({
			plugins: [],
			rules: {
				foo: "error",
			},
			transform: {},
		});
	});

	describe("getConfigFor()", () => {
		it("should use global configuration by default", () => {
			expect.assertions(1);
			/* constructor global config */
			const loader = new ExposedFileSystemConfigLoader({
				rules: {
					a: "error",
				},
			});
			/* .htmlvalidate.json */
			jest.spyOn(loader, "fromFilename").mockImplementation(() => null);
			const config = loader.getConfigFor("my-file.html");
			expect(config.get()).toEqual({
				plugins: [],
				rules: {
					a: "error",
				},
				transform: {},
			});
		});

		it("should merge global configuration with override if provided", () => {
			expect.assertions(1);
			/* constructor global config */
			const loader = new ExposedFileSystemConfigLoader({
				rules: {
					a: "error",
					b: "error",
				},
			});
			/* .htmlvalidate.json */
			jest.spyOn(loader, "fromFilename").mockImplementation(() => null);
			/* override */
			const config = loader.getConfigFor("my-file.html", {
				rules: {
					a: "warn",
					c: "warn",
				},
			});
			expect(config.get()).toEqual({
				plugins: [],
				rules: {
					a: "warn",
					b: "error",
					c: "warn",
				},
				transform: {},
			});
		});

		it("should use configuration provided by configuration loader if present", () => {
			expect.assertions(1);
			/* constructor global config */
			const loader = new ExposedFileSystemConfigLoader({
				rules: {
					a: "error",
				},
			});
			/* .htmlvalidate.json */
			jest.spyOn(loader, "fromFilename").mockImplementation(() =>
				Config.fromObject({
					rules: {
						b: "error",
					},
				})
			);
			const config = loader.getConfigFor("my-file.html");
			expect(config.get()).toEqual({
				plugins: [],
				rules: {
					b: "error",
				},
				transform: {},
			});
		});

		it("should merge configuration provided by configuration loader with override if provided", () => {
			expect.assertions(1);
			/* constructor global config */
			const loader = new ExposedFileSystemConfigLoader({
				rules: {
					a: "error",
				},
			});
			/* .htmlvalidate.json */
			jest.spyOn(loader, "fromFilename").mockImplementation(() =>
				Config.fromObject({
					rules: {
						b: "error",
						c: "error",
					},
				})
			);
			/* override */
			const config = loader.getConfigFor("my-file.html", {
				rules: {
					b: "warn",
				},
			});
			expect(config.get()).toEqual({
				plugins: [],
				rules: {
					b: "warn",
					c: "error",
				},
				transform: {},
			});
		});

		it("should not load configuration files if global config is root", () => {
			expect.assertions(2);
			const loader = new ExposedFileSystemConfigLoader({
				root: true,
			});
			const fromFilename = jest.spyOn(loader, "fromFilename");
			const config = loader.getConfigFor("my-file.html");
			expect(fromFilename).not.toHaveBeenCalled();
			expect(config.get()).toEqual(
				expect.objectContaining({
					root: true,
				})
			);
		});

		it("should merge global with override when global is root", () => {
			expect.assertions(1);
			const loader = new ExposedFileSystemConfigLoader({
				root: true,
				rules: {
					a: "error",
				},
			});
			const config = loader.getConfigFor("my-file.html", {
				rules: {
					a: "off",
				},
			});
			expect(config.get()).toEqual(
				expect.objectContaining({
					root: true,
					rules: {
						a: "off",
					},
				})
			);
		});

		it("should not load global configuration files if override config is root", () => {
			expect.assertions(2);
			const loader = new ExposedFileSystemConfigLoader({
				rules: {
					a: "error",
				},
			});
			const fromFilename = jest.spyOn(loader, "fromFilename");
			const config = loader.getConfigFor("my-file.html", {
				root: true,
				rules: {
					b: "error",
				},
			});
			expect(fromFilename).not.toHaveBeenCalled();
			expect(config.get()).toEqual(
				expect.objectContaining({
					root: true,
					rules: {
						b: "error",
					},
				})
			);
		});
	});

	describe("fromFilename()", () => {
		let loader: ExposedFileSystemConfigLoader;
		beforeEach(() => {
			loader = new ExposedFileSystemConfigLoader();
		});

		it("should load configuration", () => {
			expect.assertions(1);
			jest.spyOn(fs, "existsSync").mockImplementation((filename: fs.PathLike) => {
				return filename === path.resolve("/path/to/.htmlvalidate.json");
			});
			const config = loader.fromFilename("/path/to/target.html");
			expect(config?.get()).toEqual(
				expect.objectContaining({
					mockFilenames: [
						/* ConfigMock adds all visited filenames to this array */
						path.resolve("/path/to/.htmlvalidate.json"),
					],
				})
			);
		});

		it("should load configuration from parent directory", () => {
			expect.assertions(1);
			jest.spyOn(fs, "existsSync").mockImplementation((filename: fs.PathLike) => {
				return filename === path.resolve("/path/.htmlvalidate.json");
			});
			const config = loader.fromFilename("/path/to/target.html");
			expect(config?.get()).toEqual(
				expect.objectContaining({
					mockFilenames: [
						/* ConfigMock adds all visited filenames to this array */
						path.resolve("/path/.htmlvalidate.json"),
					],
				})
			);
		});

		it("should load configuration from multiple files", () => {
			expect.assertions(1);
			jest.spyOn(fs, "existsSync").mockImplementation(() => true);
			const config = loader.fromFilename("/path/to/target.html");
			expect(config?.get()).toEqual(
				expect.objectContaining({
					mockFilenames: [
						/* ConfigMock adds all visited filenames to this array */
						path.resolve("/.htmlvalidate.js"),
						path.resolve("/.htmlvalidate.cjs"),
						path.resolve("/.htmlvalidate.json"),
						path.resolve("/path/.htmlvalidate.js"),
						path.resolve("/path/.htmlvalidate.cjs"),
						path.resolve("/path/.htmlvalidate.json"),
						path.resolve("/path/to/.htmlvalidate.js"),
						path.resolve("/path/to/.htmlvalidate.cjs"),
						path.resolve("/path/to/.htmlvalidate.json"),
					],
				})
			);
		});

		it("should stop searching when root is found", () => {
			expect.assertions(1);
			jest.spyOn(fs, "existsSync").mockImplementation(() => true);
			const config = loader.fromFilename("/project/root/src/target.html");
			expect(config?.get()).toEqual(
				expect.objectContaining({
					mockFilenames: [
						/* ConfigMock adds all visited filenames to this array */
						path.resolve("/project/root/.htmlvalidate.js"),
						path.resolve("/project/root/.htmlvalidate.cjs"),
						path.resolve("/project/root/.htmlvalidate.json"),
						path.resolve("/project/root/src/.htmlvalidate.js"),
						path.resolve("/project/root/src/.htmlvalidate.cjs"),
						path.resolve("/project/root/src/.htmlvalidate.json"),
					],
				})
			);
		});

		it("should return null for inline sources", () => {
			expect.assertions(1);
			const config = loader.fromFilename("inline");
			expect(config).toBeNull();
		});

		it("should cache results", () => {
			expect.assertions(3);
			jest.spyOn(fs, "existsSync").mockImplementation(() => true);
			const cache = loader.mockGetInternalCache();
			expect(cache.has("/path/to/target.html")).toBeFalsy();
			loader.fromFilename("/path/to/target.html");
			expect(cache.has("/path/to/target.html")).toBeTruthy();
			expect(cache.get("/path/to/target.html")?.get()).toEqual(
				expect.objectContaining({
					mockFilenames: [
						/* ConfigMock adds all visited filenames to this array */
						path.resolve("/.htmlvalidate.js"),
						path.resolve("/.htmlvalidate.cjs"),
						path.resolve("/.htmlvalidate.json"),
						path.resolve("/path/.htmlvalidate.js"),
						path.resolve("/path/.htmlvalidate.cjs"),
						path.resolve("/path/.htmlvalidate.json"),
						path.resolve("/path/to/.htmlvalidate.js"),
						path.resolve("/path/to/.htmlvalidate.cjs"),
						path.resolve("/path/to/.htmlvalidate.json"),
					],
				})
			);
		});

		it("should load from cache if present", () => {
			expect.assertions(2);
			jest.spyOn(fs, "existsSync").mockImplementation(() => true);
			const cache = loader.mockGetInternalCache();
			loader.fromFilename("/path/to/target.html");
			expect(cache.has("/path/to/target.html")).toBeTruthy();
			jest.spyOn(MockConfigFactory, "fromFile").mockImplementation(() => {
				throw new Error("expected cache to be used");
			});
			const config = loader.fromFilename("/path/to/target.html");
			expect(config?.get()).toEqual(
				expect.objectContaining({
					mockFilenames: [
						/* ConfigMock adds all visited filenames to this array */
						path.resolve("/.htmlvalidate.js"),
						path.resolve("/.htmlvalidate.cjs"),
						path.resolve("/.htmlvalidate.json"),
						path.resolve("/path/.htmlvalidate.js"),
						path.resolve("/path/.htmlvalidate.cjs"),
						path.resolve("/path/.htmlvalidate.json"),
						path.resolve("/path/to/.htmlvalidate.js"),
						path.resolve("/path/to/.htmlvalidate.cjs"),
						path.resolve("/path/to/.htmlvalidate.json"),
					],
				})
			);
		});
	});

	describe("flushCache()", () => {
		let loader: ExposedFileSystemConfigLoader;
		beforeEach(() => {
			loader = new ExposedFileSystemConfigLoader();
		});

		it("should clear cache", () => {
			expect.assertions(2);
			const cache = loader.mockGetInternalCache();
			cache.set("foo", null);
			cache.set("bar", null);
			cache.set("baz", null);
			expect(cache.size).toBe(3);
			loader.flushCache();
			expect(cache.size).toBe(0);
		});

		it("should clear single filename", () => {
			expect.assertions(5);
			const cache = loader.mockGetInternalCache();
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

	describe("smoketest", () => {
		let loader: ExposedFileSystemConfigLoader;
		beforeAll(() => {
			loader = new ExposedFileSystemConfigLoader(undefined, Config);
		});

		/* extract only relevant rules from configuration to avoid bloat when new
		 * rules are added to recommended config */
		function filter(src: Config): ConfigData {
			const whitelisted = [
				"no-self-closing",
				"deprecated",
				"element-permitted-content",
				"void-content",
			];
			const data = { rules: {}, ...src.get() };
			data.rules = Object.keys(data.rules)
				.filter((key) => whitelisted.includes(key))
				.reduce((dst, key) => {
					dst[key] = data.rules[key];
					return dst;
				}, {} as RuleConfig);
			return data;
		}

		const files = glob.sync("test-files/config/**/*.html");
		it.each(files)("%s", (filename: string) => {
			expect.assertions(1);
			const config = loader.getConfigFor(filename);
			expect(filter(config)).toMatchSnapshot();
		});
	});
});
