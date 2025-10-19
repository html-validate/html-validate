const prompts = jest.fn();

jest.mock("prompts", () => prompts);
jest.mock("fs");

import fs from "node:fs";
import { vol } from "memfs";
import { CLI } from "./cli";

let cli: CLI;

beforeEach(() => {
	vol.reset();
	fs.mkdirSync(".", { recursive: true });
	jest.restoreAllMocks();
	cli = new CLI();
});

it.each([
	["default", []],
	["angularjs", ["AngularJS"]],
	["vuejs", ["Vue.js"]],
	["markdown", ["Markdown"]],
	["combined", ["AngularJS", "Vue.js", "Markdown"]],
])("should generate configuration for %s", async (name, frameworks) => {
	expect.assertions(1);
	prompts.mockResolvedValue({
		write: true,
		frameworks,
	});
	await cli.init(".");
	const output = fs.readFileSync(".htmlvalidate.json", "utf-8");
	expect(output).toMatchSnapshot();
});

it("should not overwrite configuration unless requested", async () => {
	expect.assertions(1);
	const existing = JSON.stringify({ existing: true }, null, 2);
	fs.writeFileSync(".htmlvalidate.json", existing, "utf-8");
	prompts.mockResolvedValue({
		overwrite: false,
	});
	try {
		await cli.init(".");
	} catch {
		/* do nothing */
	}
	const output = fs.readFileSync(".htmlvalidate.json", "utf-8");
	expect(output).toMatchInlineSnapshot(`
		"{
		  "existing": true
		}"
	`);
});

it("should overwrite configuration when requested", async () => {
	expect.assertions(1);
	const existing = JSON.stringify({ existing: true });
	fs.writeFileSync(".htmlvalidate.json", existing, "utf-8");
	prompts.mockResolvedValue({
		overwrite: true,
		frameworks: [],
	});
	await cli.init(".");
	const output = fs.readFileSync(".htmlvalidate.json", "utf-8");
	expect(output).toMatchInlineSnapshot(`
		"{
		  "elements": [
		    "html5"
		  ],
		  "extends": [
		    "html-validate:recommended"
		  ]
		}"
	`);
});

it("should always create configuration when config is missing", async () => {
	expect.assertions(1);
	prompts.mockResolvedValue({
		frameworks: [],
	});
	await cli.init(".");
	const output = fs.readFileSync(".htmlvalidate.json", "utf-8");
	expect(output).toMatchInlineSnapshot(`
		"{
		  "elements": [
		    "html5"
		  ],
		  "extends": [
		    "html-validate:recommended"
		  ]
		}"
	`);
});

it("should propagate errors from fs.writeFile", async () => {
	expect.assertions(1);
	const error: NodeJS.ErrnoException = {
		name: "ErrnoException",
		message: "mock error",
	};
	jest.spyOn(fs, "writeFile").mockImplementation((fn, data, cb) => {
		cb(error);
	});
	prompts.mockResolvedValue({
		frameworks: [],
	});
	await expect(cli.init(".")).rejects.toBe(error);
});
