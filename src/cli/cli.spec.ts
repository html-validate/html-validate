import fs from "fs";
import { CLI } from "./cli";

declare module "fs" {
	function mockFile(filePath: string, content: string): void;
	function mockReset(): void;
}

jest.mock("fs");

describe("CLI", () => {
	beforeEach(() => {
		fs.mockReset();
		fs.mockFile("package.json", "{}");
	});

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

		it("should use custom configuration file", () => {
			expect.assertions(1);
			fs.mockFile(
				"config.json",
				JSON.stringify({
					rules: {
						foo: "error",
					},
				})
			);
			const cli = new CLI({
				configFile: "config.json",
			});
			expect(cli.getConfig()).toMatchInlineSnapshot(`
				{
				  "rules": {
				    "foo": "error",
				  },
				}
			`);
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
				    "foo": 1,
				  },
				}
			`);
		});

		it("should configure multiple rule", () => {
			expect.assertions(1);
			const cli = new CLI({
				rules: ["foo:1", "bar:0"],
			});
			expect(cli.getConfig()).toMatchInlineSnapshot(`
				{
				  "extends": [],
				  "rules": {
				    "bar": 0,
				    "foo": 1,
				  },
				}
			`);
		});
	});
});
