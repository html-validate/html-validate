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
		it("should create new HtmlValidate instance", () => {
			expect.assertions(1);
			const cli = new CLI();
			const htmlvalidate = cli.getValidator();
			expect(htmlvalidate).toBeDefined();
		});
	});

	describe("getConfig()", () => {
		it("should use default configuration", () => {
			expect.assertions(1);
			const cli = new CLI();
			expect(cli.getConfig()).toMatchInlineSnapshot(`
				{
				  "extends": [
				    "html-validate:recommended",
				  ],
				}
			`);
		});

		it("should set custom preset", () => {
			expect.assertions(1);
			const cli = new CLI({
				preset: "standard",
			});
			expect(cli.getConfig()).toMatchInlineSnapshot(`
				{
				  "extends": [
				    "html-validate:standard",
				  ],
				}
			`);
		});

		it("should set multiple custom preset", () => {
			expect.assertions(1);
			const cli = new CLI({
				preset: "standard,a11y",
			});
			expect(cli.getConfig()).toMatchInlineSnapshot(`
				{
				  "extends": [
				    "html-validate:standard",
				    "html-validate:a11y",
				  ],
				}
			`);
		});

		it("should set both preset and rules", () => {
			expect.assertions(1);
			const cli = new CLI({
				preset: "standard",
				rules: ["foo:error", "bar:warn"],
			});
			expect(cli.getConfig()).toMatchInlineSnapshot(`
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

		it("should use custom json configuration file", () => {
			expect.assertions(1);
			const cli = new CLI({
				configFile: path.join(__dirname, "__fixtures__/config.json"),
			});
			expect(cli.getConfig()).toEqual({
				rules: {
					foo: "error",
				},
			});
		});

		it("should use custom js configuration file", () => {
			expect.assertions(1);
			const cli = new CLI({
				configFile: path.join(__dirname, "__fixtures__/config.js"),
			});
			expect(cli.getConfig()).toEqual({
				rules: {
					foo: "error",
				},
			});
		});

		it("should configure single rule", () => {
			expect.assertions(1);
			const cli = new CLI({
				rules: "foo:1",
			});
			expect(cli.getConfig()).toMatchInlineSnapshot(`
				{
				  "extends": [],
				  "rules": {
				    "foo": "warn",
				  },
				}
			`);
		});

		it("should configure single rule with severity string", () => {
			expect.assertions(1);
			const cli = new CLI({
				rules: "foo:warn",
			});
			expect(cli.getConfig()).toMatchInlineSnapshot(`
				{
				  "extends": [],
				  "rules": {
				    "foo": "warn",
				  },
				}
			`);
		});

		it("should handle numeric severity", () => {
			expect.assertions(1);
			const cli = new CLI({
				rules: ["foo:2", "bar:1", "baz:0"],
			});
			expect(cli.getConfig()).toMatchInlineSnapshot(`
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

		it("should configure multiple rules", () => {
			expect.assertions(1);
			const cli = new CLI({
				rules: ["foo:warn", "bar:off"],
			});
			expect(cli.getConfig()).toMatchInlineSnapshot(`
				{
				  "extends": [],
				  "rules": {
				    "bar": "off",
				    "foo": "warn",
				  },
				}
			`);
		});

		it("should throw helpful error message if file cant be loaded", () => {
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
