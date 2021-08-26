jest.mock("fs");
jest.mock("./is-ignored");

import fs from "fs";
import path from "path";
import { CLI } from "./cli";

declare module "fs" {
	function mockFile(filePath: string, content: string): void;
	function mockReset(): void;
}

declare module "glob" {
	function setMockFiles(files: string[]): void;
	function resetMock(): void;
}

function resolve(cwd: string, filePath: string): string {
	return path.normalize(path.join(cwd, filePath));
}

let cli: CLI;
const cwd = path.join(__dirname, "../..");

beforeEach(() => {
	fs.mockReset();
	fs.mockFile("package.json", "{}");
	fs.mockFile("foo.html", "");
	fs.mockFile("bar/fred.html", "");
	fs.mockFile("bar/fred.json", "");
	fs.mockFile("bar/barney.html", "");
	fs.mockFile("bar/barney.js", "");
	fs.mockFile("baz/spam.html", "");
	cli = new CLI();
});

describe("expandFiles()", () => {
	it("should expand globs", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["foo.html", "bar/**/*.html"], { cwd })).toEqual([
			resolve(cwd, "foo.html"),
			resolve(cwd, "bar/barney.html"),
			resolve(cwd, "bar/fred.html"),
		]);
	});

	it("should expand directories (default extensions)", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["bar"], { cwd })).toEqual([
			resolve(cwd, "bar/barney.html"),
			resolve(cwd, "bar/fred.html"),
		]);
	});

	it("should expand directories (explicit extensions)", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["bar"], { extensions: ["js", "json"] })).toEqual([
			resolve(cwd, "bar/barney.js"),
			resolve(cwd, "bar/fred.json"),
		]);
	});

	it("should expand directories (no extensions => all files)", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["bar"], { extensions: [], cwd })).toEqual([
			resolve(cwd, "bar/barney.html"),
			resolve(cwd, "bar/barney.js"),
			resolve(cwd, "bar/fred.html"),
			resolve(cwd, "bar/fred.json"),
		]);
	});

	it("should handle absolute paths", () => {
		expect.assertions(1);
		const patterns = [path.join(cwd, "foo.html"), path.join(cwd, "bar")];
		expect(cli.expandFiles(patterns, { cwd })).toEqual([
			resolve(cwd, "foo.html"),
			resolve(cwd, "bar/barney.html"),
			resolve(cwd, "bar/fred.html"),
		]);
	});

	it("should remove duplicates", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["foo.html", "foo.html"], { cwd })).toEqual([resolve(cwd, "foo.html")]);
	});

	it("should fallback on process.cwd()", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["foo.html"])).toEqual([resolve(process.cwd(), "foo.html")]);
	});

	it("should replace - placeholder", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["-"], { cwd })).toEqual(["/dev/stdin"]);
	});
});
