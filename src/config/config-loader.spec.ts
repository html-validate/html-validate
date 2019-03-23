import fs from "fs";
import glob from "glob";
import path from "path";
import { Config, ConfigLoader } from ".";
import HtmlValidate from "../htmlvalidate";

declare module "./config-data" {
	interface ConfigData {
		mockFilenames?: string[];
	}
}

class MockConfig {
	public static empty(): Config {
		return Config.empty();
	}

	public static fromFile(filename: string): Config {
		return Config.fromObject({
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
			jest.spyOn(fs, "existsSync").mockImplementation((filename: string) => {
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
			jest.spyOn(fs, "existsSync").mockImplementation((filename: string) => {
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

		it("should load empty config for inline sources", () => {
			const config = loader.fromTarget("inline");
			expect(config.get()).toEqual(Config.empty().get());
		});

		it("should cache results", () => {
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
			const cache = getInteralCache(loader);
			cache.set("foo", null);
			cache.set("bar", null);
			cache.set("baz", null);
			expect(cache.size).toEqual(3);
			loader.flush();
			expect(cache.size).toEqual(0);
		});

		it("flush() should clear single filename", () => {
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

		const files = glob.sync("test-files/config/**/*.html");
		files.forEach((filename: string) => {
			it(filename, () => {
				const htmlvalidate = new HtmlValidate();
				const config = htmlvalidate.getConfigFor(filename);
				const report = htmlvalidate.validateFile(filename);
				expect(config.get()).toMatchSnapshot();
				expect(report.results).toMatchSnapshot();
			});
		});
	});
});
