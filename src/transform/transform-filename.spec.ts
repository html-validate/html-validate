import fs from "node:fs";
import { memfs } from "memfs";
import { type ResolvedConfigData, ResolvedConfig } from "../config";
import { MetaTable } from "../meta";
import { transformFilename, transformFilenameSync } from "./transform-filename";

function createMockConfig(config: Partial<ResolvedConfigData> = {}): ResolvedConfig {
	const metaTable = new MetaTable();
	const defaults: ResolvedConfigData = {
		metaTable,
		plugins: [],
		rules: new Map(),
		transformers: [],
	};
	return new ResolvedConfig({ ...defaults, ...config }, {});
}

beforeEach(() => {
	jest.restoreAllMocks();
});

describe("transformFilename()", () => {
	it("should default to reading full file", async () => {
		expect.assertions(1);
		const config = createMockConfig();
		const result = await transformFilename([], config, "test-files/parser/simple.html", fs);
		expect(result).toMatchInlineSnapshot(`
			[
			  {
			    "column": 1,
			    "data": "<p id="foo">Lorem ipsum</p>
			",
			    "filename": "test-files/parser/simple.html",
			    "line": 1,
			    "offset": 0,
			    "originalData": "<p id="foo">Lorem ipsum</p>
			",
			  },
			]
		`);
	});

	it("should handle stdin", async () => {
		expect.assertions(2);
		const spy = jest.spyOn(fs, "readFileSync").mockReturnValue("<div></div>");
		const config = createMockConfig();
		const source = await transformFilename([], config, "/dev/stdin", fs);
		const stdin = 0;
		expect(spy).toHaveBeenCalledWith(stdin, expect.anything());
		expect(source).toMatchInlineSnapshot(`
			[
			  {
			    "column": 1,
			    "data": "<div></div>",
			    "filename": "/dev/stdin",
			    "line": 1,
			    "offset": 0,
			    "originalData": "<div></div>",
			  },
			]
		`);
	});

	it("should work with memfs", async () => {
		expect.assertions(1);
		const { fs } = memfs({
			"/foo.html": /* HTML */ ` <p>lorem ipsum</p> `,
		});
		const config = createMockConfig();
		const result = await transformFilename([], config, "/foo.html", fs);
		expect(result).toMatchInlineSnapshot(`
		[
		  {
		    "column": 1,
		    "data": " <p>lorem ipsum</p> ",
		    "filename": "/foo.html",
		    "line": 1,
		    "offset": 0,
		    "originalData": " <p>lorem ipsum</p> ",
		  },
		]
	`);
	});
});

describe("transformFilenameSync()", () => {
	it("should default to reading full file", () => {
		expect.assertions(1);
		const config = createMockConfig();
		const result = transformFilenameSync([], config, "test-files/parser/simple.html", fs);
		expect(result).toMatchInlineSnapshot(`
			[
			  {
			    "column": 1,
			    "data": "<p id="foo">Lorem ipsum</p>
			",
			    "filename": "test-files/parser/simple.html",
			    "line": 1,
			    "offset": 0,
			    "originalData": "<p id="foo">Lorem ipsum</p>
			",
			  },
			]
		`);
	});

	it("should handle stdin", () => {
		expect.assertions(2);
		const spy = jest.spyOn(fs, "readFileSync").mockReturnValue("<div></div>");
		const config = createMockConfig();
		const source = transformFilenameSync([], config, "/dev/stdin", fs);
		const stdin = 0;
		expect(spy).toHaveBeenCalledWith(stdin, expect.anything());
		expect(source).toMatchInlineSnapshot(`
			[
			  {
			    "column": 1,
			    "data": "<div></div>",
			    "filename": "/dev/stdin",
			    "line": 1,
			    "offset": 0,
			    "originalData": "<div></div>",
			  },
			]
		`);
	});

	it("should work with memfs", () => {
		expect.assertions(1);
		const { fs } = memfs({
			"/foo.html": /* HTML */ ` <p>lorem ipsum</p> `,
		});
		const config = createMockConfig();
		const result = transformFilenameSync([], config, "/foo.html", fs);
		expect(result).toMatchInlineSnapshot(`
		[
		  {
		    "column": 1,
		    "data": " <p>lorem ipsum</p> ",
		    "filename": "/foo.html",
		    "line": 1,
		    "offset": 0,
		    "originalData": " <p>lorem ipsum</p> ",
		  },
		]
	`);
	});
});
