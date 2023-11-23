jest.mock("fs");
jest.mock("./is-ignored");

import { vol } from "memfs";
import { CLI } from "./cli";

let cli: CLI;
const cwd = "/folder";

beforeEach(() => {
	jest.restoreAllMocks();
	vol.fromJSON(
		{
			"package.json": "{}",
			"foo.html": "",
			"bar/fred.html": "",
			"bar/fred.json": "",
			"bar/barney.html": "",
			"bar/barney.js": "",
			"baz/spam.html": "",
		},
		"/folder",
	);
	cli = new CLI();
});

describe("expandFiles()", () => {
	it("should expand globs", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["foo.html", "bar/**/*.html"], { cwd })).toMatchInlineSnapshot(`
			[
			  "/folder/foo.html",
			  "/folder/bar/barney.html",
			  "/folder/bar/fred.html",
			]
		`);
	});

	it("should expand directories (default extensions)", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["bar"], { cwd })).toMatchInlineSnapshot(`
			[
			  "/folder/bar/barney.html",
			  "/folder/bar/fred.html",
			]
		`);
	});

	it("should expand directories (explicit extensions)", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["bar"], { extensions: ["js", "json"], cwd })).toMatchInlineSnapshot(`
			[
			  "/folder/bar/barney.js",
			  "/folder/bar/fred.json",
			]
		`);
	});

	it("should expand directories (no extensions => all files)", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["bar"], { extensions: [], cwd })).toMatchInlineSnapshot(`
			[
			  "/folder/bar/barney.html",
			  "/folder/bar/barney.js",
			  "/folder/bar/fred.html",
			  "/folder/bar/fred.json",
			]
		`);
	});

	it("should handle absolute paths", () => {
		expect.assertions(1);
		const patterns = [`${cwd}/foo.html`, `${cwd}/bar`];
		expect(cli.expandFiles(patterns, { cwd })).toMatchInlineSnapshot(`
			[
			  "/folder/foo.html",
			  "/folder/bar/barney.html",
			  "/folder/bar/fred.html",
			]
		`);
	});

	it("should remove duplicates", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["foo.html", "foo.html", "*.html"], { cwd })).toMatchInlineSnapshot(`
			[
			  "/folder/foo.html",
			]
		`);
	});

	it("should fallback on process.cwd()", () => {
		expect.assertions(1);
		jest.spyOn(process, "cwd").mockReturnValue(cwd);
		expect(cli.expandFiles(["foo.html"])).toMatchInlineSnapshot(`
			[
			  "/folder/foo.html",
			]
		`);
	});

	it("should replace - placeholder", () => {
		expect.assertions(1);
		expect(cli.expandFiles(["-"], { cwd })).toEqual(["/dev/stdin"]);
	});
});
