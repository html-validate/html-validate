import fs from "fs";
import path from "path";
import glob from "glob";
import HtmlValidate from "../htmlvalidate";
import { Config, ConfigData, ConfigLoader, RuleConfig } from ".";

declare module "./config-data" {
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
		public addMetaSchema(): void {
			/* do nothing */
		}
		public addKeyword(): void {
			/* do nothing */
		}
	}
	return MockAjv;
});

class MockConfig {
	public static empty(): Config {
		return Config.empty();
	}

	public static fromFile(filename: string): Config {
		return Config.fromObject({
			/* set root to true for if the last directory name is literal "root" */
			root: path.basename(path.dirname(filename)) === "root",

			mockFilenames: [filename],
		});
	}
}

function getInteralCache(loader: ConfigLoader): Map<string, Config> {
	return (loader as any).cache;
}

describe("ConfigLoader", () => {
	let loader: ConfigLoader;

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("fromTarget()", () => {
		beforeEach(() => {
			loader = new ConfigLoader(MockConfig);
		});

		it("should load configuration", () => {
			expect.assertions(1);
			jest
				.spyOn(fs, "existsSync")
				.mockImplementation((filename: fs.PathLike) => {
					return filename === path.resolve("/path/to/.htmlvalidate.json");
				});
			const config = loader.fromTarget("/path/to/target.html");
			expect(config.get()).toEqual(
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
			jest
				.spyOn(fs, "existsSync")
				.mockImplementation((filename: fs.PathLike) => {
					return filename === path.resolve("/path/.htmlvalidate.json");
				});
			const config = loader.fromTarget("/path/to/target.html");
			expect(config.get()).toEqual(
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
			const config = loader.fromTarget("/path/to/target.html");
			expect(config.get()).toEqual(
				expect.objectContaining({
					mockFilenames: [
						/* ConfigMock adds all visited filenames to this array */
						path.resolve("/.htmlvalidate.json"),
						path.resolve("/path/.htmlvalidate.json"),
						path.resolve("/path/to/.htmlvalidate.json"),
					],
				})
			);
		});

		it("should stop searching when root is found", () => {
			expect.assertions(1);
			jest.spyOn(fs, "existsSync").mockImplementation(() => true);
			const config = loader.fromTarget("/project/root/src/target.html");
			expect(config.get()).toEqual(
				expect.objectContaining({
					mockFilenames: [
						/* ConfigMock adds all visited filenames to this array */
						path.resolve("/project/root/.htmlvalidate.json"),
						path.resolve("/project/root/src/.htmlvalidate.json"),
					],
				})
			);
		});

		it("should load empty config for inline sources", () => {
			expect.assertions(1);
			const config = loader.fromTarget("inline");
			expect(config.get()).toEqual(Config.empty().get());
		});

		it("should cache results", () => {
			expect.assertions(3);
			jest.spyOn(fs, "existsSync").mockImplementation(() => true);
			const cache = getInteralCache(loader);
			expect(cache.has("/path/to/target.html")).toBeFalsy();
			loader.fromTarget("/path/to/target.html");
			expect(cache.has("/path/to/target.html")).toBeTruthy();
			expect(cache.get("/path/to/target.html").get()).toEqual(
				expect.objectContaining({
					mockFilenames: [
						/* ConfigMock adds all visited filenames to this array */
						path.resolve("/.htmlvalidate.json"),
						path.resolve("/path/.htmlvalidate.json"),
						path.resolve("/path/to/.htmlvalidate.json"),
					],
				})
			);
		});

		it("should load from cache if present", () => {
			expect.assertions(2);
			jest.spyOn(fs, "existsSync").mockImplementation(() => true);
			const cache = getInteralCache(loader);
			loader.fromTarget("/path/to/target.html");
			expect(cache.has("/path/to/target.html")).toBeTruthy();
			jest.spyOn(MockConfig, "fromFile").mockImplementation(() => {
				throw new Error("expected cache to be used");
			});
			const config = loader.fromTarget("/path/to/target.html");
			expect(config.get()).toEqual(
				expect.objectContaining({
					mockFilenames: [
						/* ConfigMock adds all visited filenames to this array */
						path.resolve("/.htmlvalidate.json"),
						path.resolve("/path/.htmlvalidate.json"),
						path.resolve("/path/to/.htmlvalidate.json"),
					],
				})
			);
		});
	});

	describe("flush()", () => {
		beforeEach(() => {
			loader = new ConfigLoader(MockConfig);
		});

		it("flush() should clear cache", () => {
			expect.assertions(2);
			const cache = getInteralCache(loader);
			cache.set("foo", null);
			cache.set("bar", null);
			cache.set("baz", null);
			expect(cache.size).toEqual(3);
			loader.flush();
			expect(cache.size).toEqual(0);
		});

		it("flush() should clear single filename", () => {
			expect.assertions(5);
			const cache = getInteralCache(loader);
			cache.set("foo", null);
			cache.set("bar", null);
			cache.set("baz", null);
			expect(cache.size).toEqual(3);
			loader.flush("foo");
			expect(cache.size).toEqual(2);
			expect(cache.has("foo")).toBeFalsy();
			expect(cache.has("bar")).toBeTruthy();
			expect(cache.has("baz")).toBeTruthy();
		});
	});

	describe("smoketest", () => {
		beforeAll(() => {
			loader = new ConfigLoader(Config);
		});

		/* extract only relevant rules from configuration to avoid bloat when new
		 * rules are added to recommended config */
		function filter(src: Config): ConfigData {
			const whitelisted = [
				"no-self-closing",
				"deprecated",
				"element-permitted-content",
			];
			const data = src.get();
			data.rules = Object.keys(data.rules)
				.filter((key) => whitelisted.includes(key))
				.reduce((dst, key) => {
					dst[key] = data.rules[key];
					return dst;
				}, {} as RuleConfig);
			return data;
		}

		const files = glob.sync("test-files/config/**/*.html");
		files.forEach((filename: string) => {
			it(filename, () => {
				expect.assertions(2);
				const htmlvalidate = new HtmlValidate();
				const config = htmlvalidate.getConfigFor(filename);
				const report = htmlvalidate.validateFile(filename);
				expect(filter(config)).toMatchSnapshot();
				expect(report.results).toMatchSnapshot();
			});
		});
	});
});
