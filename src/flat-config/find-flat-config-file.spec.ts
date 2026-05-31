import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fs, vol } from "memfs";
import { findFlatConfigFile } from "./find-flat-config-file";

jest.mock("node:fs", () => fs);

beforeEach(() => {
	vol.reset();
});

describe("findFlatConfigFile()", () => {
	it("should return null when no config file exists", () => {
		expect.assertions(1);
		vol.fromJSON({ "/project/index.html": "" });
		expect(findFlatConfigFile("/project")).toBeNull();
	});

	it("should find config file in the given directory", () => {
		expect.assertions(1);
		vol.fromJSON({ "/project/html-validate.config.js": "" });
		expect(findFlatConfigFile("/project")).toBe("/project/html-validate.config.js");
	});

	it("should find config file in a parent directory", () => {
		expect.assertions(1);
		vol.fromJSON({
			"/project/html-validate.config.js": "",
			"/project/src/index.html": "",
		});
		expect(findFlatConfigFile("/project/src")).toBe("/project/html-validate.config.js");
	});

	it("should find config file in a deeply nested parent directory", () => {
		expect.assertions(1);
		vol.fromJSON({
			"/project/html-validate.config.js": "",
			"/project/a/b/c/index.html": "",
		});
		expect(findFlatConfigFile("/project/a/b/c")).toBe("/project/html-validate.config.js");
	});

	it("should prefer file in closer directory over parent", () => {
		expect.assertions(1);
		vol.fromJSON({
			"/project/html-validate.config.js": "",
			"/project/src/html-validate.config.js": "",
		});
		expect(findFlatConfigFile("/project/src")).toBe("/project/src/html-validate.config.js");
	});
});
