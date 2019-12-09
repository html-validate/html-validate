import fs from "fs";
import HtmlValidate from "../htmlvalidate";
import { CLI } from "./cli";

jest.disableAutomock();
jest.mock("fs");
jest.mock("../htmlvalidate");

describe("CLI", () => {
	beforeEach(() => {
		(HtmlValidate as any).mockClear();
	});

	describe("getValidator()", () => {
		it("should create new HtmlValidate instance", () => {
			const cli = new CLI();
			const htmlvalidate = cli.getValidator();
			expect(HtmlValidate).toHaveBeenCalledWith({
				extends: ["html-validate:recommended"],
			});
			expect(htmlvalidate).toBeDefined();
		});

		it("should use configuration file", () => {
			const readFileSync = jest
				.spyOn(fs, "readFileSync")
				.mockImplementation(() => '{"rules": {"foo": "error"}}');
			const cli = new CLI({
				configFile: "config.json",
			});
			const htmlvalidate = cli.getValidator();
			expect(HtmlValidate).toHaveBeenCalledWith({
				rules: {
					foo: "error",
				},
			});
			expect(htmlvalidate).toBeDefined();
			expect(readFileSync).toHaveBeenCalledWith("config.json", "utf-8");
		});

		it("should configure single rule", () => {
			const cli = new CLI({
				rules: "foo:1",
			});
			const htmlvalidate = cli.getValidator();
			expect(HtmlValidate).toHaveBeenCalledWith({
				extends: [],
				rules: {
					foo: 1,
				},
			});
			expect(htmlvalidate).toBeDefined();
		});

		it("should configure multiple rule", () => {
			const cli = new CLI({
				rules: ["foo:1", "bar:0"],
			});
			const htmlvalidate = cli.getValidator();
			expect(HtmlValidate).toHaveBeenCalledWith({
				extends: [],
				rules: {
					foo: 1,
					bar: 0,
				},
			});
			expect(htmlvalidate).toBeDefined();
		});
	});
});
