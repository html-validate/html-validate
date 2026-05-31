import path from "node:path";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { vol } from "memfs";
import { FileSystemConfigLoader } from "../config/loaders/file-system";
import { FlatConfigLoader } from "../flat-config";
import { CLI } from "./cli";

jest.mock("fs");
jest.spyOn(process, "cwd").mockReturnValue("/folder");

beforeEach(() => {
	vol.fromJSON(
		{
			"package.json": "{}",
		},
		"/folder",
	);
});

describe("CLI", () => {
	describe("getValidator()", () => {
		it("should create new HtmlValidate instance", async () => {
			expect.assertions(1);
			const cli = new CLI();
			const htmlvalidate = await cli.getValidator();
			expect(htmlvalidate).toBeDefined();
		});
	});

	describe("getConfig()", () => {
		it("should use default configuration", async () => {
			expect.assertions(1);
			const cli = new CLI();
			const config = await cli.getConfig();
			expect(config).toMatchInlineSnapshot(`
				{
				  "extends": [
				    "html-validate:recommended",
				  ],
				}
			`);
		});

		it("should set custom preset", async () => {
			expect.assertions(1);
			const cli = new CLI({
				preset: "standard",
			});
			const config = await cli.getConfig();
			expect(config).toMatchInlineSnapshot(`
				{
				  "extends": [
				    "html-validate:standard",
				  ],
				}
			`);
		});

		it("should set multiple custom preset", async () => {
			expect.assertions(1);
			const cli = new CLI({
				preset: "standard,a11y",
			});
			const config = await cli.getConfig();
			expect(config).toMatchInlineSnapshot(`
				{
				  "extends": [
				    "html-validate:standard",
				    "html-validate:a11y",
				  ],
				}
			`);
		});

		it("should set both preset and rules", async () => {
			expect.assertions(1);
			const cli = new CLI({
				preset: "standard",
				rules: ["foo:error", "bar:warn"],
			});
			const config = await cli.getConfig();
			expect(config).toMatchInlineSnapshot(`
				{
				  "extends": [
				    "html-validate:standard",
				  ],
				  "rules": {
				    "bar": "warn",
				    "foo": "error",
				  },
				}
			`);
		});

		it("should use custom json configuration file", async () => {
			expect.assertions(1);
			const cli = new CLI({
				configFile: path.join(__dirname, "__fixtures__/config.json"),
			});
			const config = await cli.getConfig();
			expect(config).toEqual({
				rules: {
					foo: "error",
				},
			});
		});

		it("should use custom js configuration file", async () => {
			expect.assertions(1);
			const cli = new CLI({
				configFile: path.join(__dirname, "__fixtures__/config.js"),
			});
			const config = await cli.getConfig();
			expect(config).toEqual({
				rules: {
					foo: "error",
				},
			});
		});

		it("should use custom cjs configuration file", async () => {
			expect.assertions(1);
			const cli = new CLI({
				configFile: path.join(__dirname, "__fixtures__/config.cjs"),
			});
			const config = await cli.getConfig();
			expect(config).toEqual({
				rules: {
					foo: "error",
				},
			});
		});

		it("should use custom mjs configuration file", async () => {
			expect.assertions(1);
			const cli = new CLI({
				configFile: path.join(__dirname, "__fixtures__/config.mjs"),
			});
			const config = await cli.getConfig();
			expect(config).toEqual({
				rules: {
					foo: "error",
				},
			});
		});

		it("should configure single rule", async () => {
			expect.assertions(1);
			const cli = new CLI({
				rules: "foo:1",
			});
			const config = await cli.getConfig();
			expect(config).toMatchInlineSnapshot(`
				{
				  "extends": [],
				  "rules": {
				    "foo": "warn",
				  },
				}
			`);
		});

		it("should configure single rule with severity string", async () => {
			expect.assertions(1);
			const cli = new CLI({
				rules: "foo:warn",
			});
			const config = await cli.getConfig();
			expect(config).toMatchInlineSnapshot(`
				{
				  "extends": [],
				  "rules": {
				    "foo": "warn",
				  },
				}
			`);
		});

		it("should handle numeric severity", async () => {
			expect.assertions(1);
			const cli = new CLI({
				rules: ["foo:2", "bar:1", "baz:0"],
			});
			const config = await cli.getConfig();
			expect(config).toMatchInlineSnapshot(`
				{
				  "extends": [],
				  "rules": {
				    "bar": "warn",
				    "baz": "off",
				    "foo": "error",
				  },
				}
			`);
		});

		it("should configure multiple rules", async () => {
			expect.assertions(1);
			const cli = new CLI({
				rules: ["foo:warn", "bar:off"],
			});
			const config = await cli.getConfig();
			expect(config).toMatchInlineSnapshot(`
				{
				  "extends": [],
				  "rules": {
				    "bar": "off",
				    "foo": "warn",
				  },
				}
			`);
		});

		it("should combine configuration file with rules", async () => {
			expect.assertions(1);
			const cli = new CLI({
				configFile: path.join(__dirname, "__fixtures__/config.json"),
				rules: ["bar:error", "baz:off"],
			});
			const config = await cli.getConfig();
			expect(config).toEqual({
				rules: {
					foo: "error",
					bar: "error",
					baz: "off",
				},
			});
		});

		it("should combine extended configuration file with rules", async () => {
			expect.assertions(1);
			const cli = new CLI({
				configFile: path.join(__dirname, "__fixtures__/config-with-extend.json"),
				rules: ["bar:error", "baz:off"],
			});
			const config = await cli.getConfig();
			expect(config).toEqual({
				extends: ["html-validate:standard"],
				rules: {
					foo: "error",
					bar: "error",
					baz: "off",
				},
			});
		});

		it("should combine preset with rules", async () => {
			expect.assertions(1);
			const cli = new CLI({
				preset: "standard",
				rules: ["bar:error", "baz:off"],
			});
			const config = await cli.getConfig();
			expect(config).toEqual({
				extends: ["html-validate:standard"],
				rules: {
					bar: "error",
					baz: "off",
				},
			});
		});

		it("should throw helpful error message if file cant be loaded", async () => {
			expect.assertions(1);
			const cli = new CLI({
				configFile: "missing-file.js",
			});
			await expect(() => cli.getConfig()).rejects.toThrowErrorMatchingInlineSnapshot(
				`"Failed to read configuration from "missing-file.js""`,
			);
		});
	});

	describe("getLoader()", () => {
		it("should use FlatConfigLoader when flat config file is found", async () => {
			expect.assertions(1);
			const spy = jest
				.spyOn(FlatConfigLoader, "fromDirectory")
				.mockReturnValueOnce(new FlatConfigLoader("/folder/html-validate.config.js"));
			const cli = new CLI();
			const loader = await cli.getLoader();
			spy.mockRestore();
			expect(loader).toBeInstanceOf(FlatConfigLoader);
		});

		it("should fall back to FileSystemConfigLoader when no flat config is found", async () => {
			expect.assertions(1);
			const spy = jest.spyOn(FlatConfigLoader, "fromDirectory").mockReturnValueOnce(null);
			const cli = new CLI();
			const loader = await cli.getLoader();
			spy.mockRestore();
			expect(loader).toBeInstanceOf(FileSystemConfigLoader);
		});

		it("should skip flat config detection when --config is explicitly specified", async () => {
			expect.assertions(2);
			const fromDirSpy = jest.spyOn(FlatConfigLoader, "fromDirectory");
			const cli = new CLI({ configFile: ".htmlvalidate.json" });
			jest.spyOn(cli, "getConfig").mockResolvedValueOnce({});
			const loader = await cli.getLoader();
			fromDirSpy.mockRestore();
			expect(loader).toBeInstanceOf(FileSystemConfigLoader);
			expect(fromDirSpy).not.toHaveBeenCalled();
		});
	});
});
