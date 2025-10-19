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
	it("should expand globs", async () => {
		expect.assertions(1);
		const result = await cli.expandFiles(["foo.html", "bar/**/*.html"], { cwd });
		expect(result).toMatchInlineSnapshot(`
			[
			  "/folder/foo.html",
			  "/folder/bar/barney.html",
			  "/folder/bar/fred.html",
			]
		`);
	});

	it("should expand directories (default extensions)", async () => {
		expect.assertions(1);
		const result = await cli.expandFiles(["bar"], { cwd });
		expect(result).toMatchInlineSnapshot(`
			[
			  "/folder/bar/barney.html",
			  "/folder/bar/fred.html",
			]
		`);
	});

	it("should expand directories (explicit extensions)", async () => {
		expect.assertions(1);
		const result = await cli.expandFiles(["bar"], { extensions: ["js", "json"], cwd });
		expect(result).toMatchInlineSnapshot(`
			[
			  "/folder/bar/barney.js",
			  "/folder/bar/fred.json",
			]
		`);
	});

	it("should expand directories (no extensions => all files)", async () => {
		expect.assertions(1);
		const result = await cli.expandFiles(["bar"], { extensions: [], cwd });
		expect(result).toMatchInlineSnapshot(`
			[
			  "/folder/bar/barney.html",
			  "/folder/bar/barney.js",
			  "/folder/bar/fred.html",
			  "/folder/bar/fred.json",
			]
		`);
	});

	it("should handle absolute paths", async () => {
		expect.assertions(1);
		const patterns = [`${cwd}/foo.html`, `${cwd}/bar`];
		const result = await cli.expandFiles(patterns, { cwd });
		expect(result).toMatchInlineSnapshot(`
			[
			  "/folder/foo.html",
			  "/folder/bar/barney.html",
			  "/folder/bar/fred.html",
			]
		`);
	});

	it("should remove duplicates", async () => {
		expect.assertions(1);
		const result = await cli.expandFiles(["foo.html", "foo.html", "*.html"], { cwd });
		expect(result).toMatchInlineSnapshot(`
			[
			  "/folder/foo.html",
			]
		`);
	});

	it("should fallback on process.cwd()", async () => {
		expect.assertions(1);
		jest.spyOn(process, "cwd").mockReturnValue(cwd);
		const result = await cli.expandFiles(["foo.html"]);
		expect(result).toMatchInlineSnapshot(`
			[
			  "/folder/foo.html",
			]
		`);
	});

	it("should replace - placeholder", async () => {
		expect.assertions(1);
		expect(await cli.expandFiles(["-"], { cwd })).toEqual(["/dev/stdin"]);
	});
});
