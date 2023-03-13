import path from "path";
import { vol } from "memfs";
import { CLI } from "./cli";

jest.mock("fs");
jest.spyOn(process, "cwd").mockReturnValue("/folder");

beforeEach(() => {
	vol.fromJSON(
		{
			"package.json": "{}",
		},
		"/folder"
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
