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

let cli: CLI;

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
		expect(cli.expandFiles(["foo.html", "bar/**/*.html"])).toEqual([
			path.normalize("foo.html"),
			path.normalize("bar/barney.html"),
			path.normalize("bar/fred.html"),
		]);
	});

	it("should expand directories (default extensions)", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["bar"])).toEqual([
			path.normalize("bar/barney.html"),
			path.normalize("bar/fred.html"),
		]);
	});

	it("should expand directories (explicit extensions)", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["bar"], { extensions: ["js", "json"] })).toEqual([
			path.normalize("bar/barney.js"),
			path.normalize("bar/fred.json"),
		]);
	});

	it("should expand directories (no extensions => all files)", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["bar"], { extensions: [] })).toEqual([
			path.normalize("bar/barney.html"),
			path.normalize("bar/barney.js"),
			path.normalize("bar/fred.html"),
			path.normalize("bar/fred.json"),
		]);
	});

	it("should remove duplicates", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["foo.html", "foo.html"])).toEqual(["foo.html"]);
	});

	it("should replace - placeholder", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["-"])).toEqual(["/dev/stdin"]);
	});
});
