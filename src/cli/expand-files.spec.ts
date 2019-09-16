jest.mock("fs");
jest.mock("glob");

import fs from "fs";
import glob from "glob";
import { expandFiles } from "./expand-files";

declare module "fs" {
	function setMockDirectories(directories: string[]): void;
}

declare module "glob" {
	function setMockFiles(files: string[]): void;
	function resetMock(): void;
}

beforeEach(() => {
	glob.setMockFiles([
		"/dev/stdin",
		"foo.html",
		"bar",
		"bar/fred.html",
		"bar/fred.json",
		"bar/barney.html",
		"bar/barney.js",
		"baz",
		"baz/spam.html",
	]);
	fs.setMockDirectories(["bar"]);
});

afterAll(() => {
	glob.resetMock();
});

describe("expandFiles()", () => {
	it("should expand globs", () => {
		const spy = jest.spyOn(glob, "sync");
		expect(expandFiles(["foo.html", "bar/**/*.html"])).toEqual([
			"foo.html",
			"bar/fred.html",
			"bar/barney.html",
		]);
		expect(spy).toHaveBeenCalledWith("foo.html", expect.anything());
		expect(spy).toHaveBeenCalledWith("bar/**/*.html", expect.anything());
	});

	it("should expand directories (default extensions)", () => {
		expect(expandFiles(["bar"])).toEqual(["bar/fred.html", "bar/barney.html"]);
	});

	it("should expand directories (explicit extensions)", () => {
		expect(expandFiles(["bar"], { extensions: ["js", "json"] })).toEqual([
			"bar/fred.json",
			"bar/barney.js",
		]);
	});

	it("should expand directories (no extensions => all files)", () => {
		expect(expandFiles(["bar"], { extensions: [] })).toEqual([
			"bar/fred.html",
			"bar/fred.json",
			"bar/barney.html",
			"bar/barney.js",
		]);
	});

	it("should remove duplicates", () => {
		expect(expandFiles(["foo.html", "foo.html"])).toEqual(["foo.html"]);
	});

	it("should replace - placeholder", () => {
		expect(expandFiles(["-"])).toEqual(["/dev/stdin"]);
	});
});
