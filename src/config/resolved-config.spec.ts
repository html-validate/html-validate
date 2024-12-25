import fs from "fs";
import { MetaTable } from "../meta";
import { type ResolvedConfigData, ResolvedConfig } from "./resolved-config";

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
		const result = await config.transformFilename([], "test-files/parser/simple.html");
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
		const source = await config.transformFilename([], "/dev/stdin");
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
});

describe("transformFilenameSync()", () => {
	it("should default to reading full file", () => {
		expect.assertions(1);
		const config = createMockConfig();
		const result = config.transformFilenameSync([], "test-files/parser/simple.html");
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
		const source = config.transformFilenameSync([], "/dev/stdin");
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
});

describe("canTransform()", () => {
	let config: ResolvedConfig;

	beforeEach(() => {
		config = createMockConfig({
			transformers: [{ kind: "import", pattern: /^.*\.foo$/, name: "mock-transform" }],
		});
	});

	it("should return true if a transformer can handle the file", () => {
		expect.assertions(1);
		expect(config.canTransform("my-file.foo")).toBeTruthy();
	});

	it("should return false if no transformer can handle the file", () => {
		expect.assertions(1);
		expect(config.canTransform("my-file.bar")).toBeFalsy();
	});
});
