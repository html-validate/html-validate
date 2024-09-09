import path from "node:path";
import { vol } from "memfs";
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

		it("should throw helpful error message if file cant be loaded", async () => {
			expect.assertions(1);
			const cli = new CLI({
				configFile: "missing-file.js",
			});
			expect(() => cli.getConfig()).toThrowErrorMatchingInlineSnapshot(
				`"Failed to read configuration from "missing-file.js""`,
			);
		});
	});
});
