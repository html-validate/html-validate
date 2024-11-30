import fs from "fs";
import { type Source } from "../context";
import { MetaTable } from "../meta";
import { type ResolvedConfigData, ResolvedConfig } from "./resolved-config";
import { staticResolver } from "./resolver";

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

describe("transformSource()", () => {
	let source: Source;

	beforeEach(() => {
		source = {
			filename: "/path/to/test.foo",
			data: "original data",
			line: 2,
			column: 3,
			offset: 4,
		};
	});

	it("should match filename against transformer", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [{ pattern: /^.*\.foo$/, name: "mock-transform" }],
		});
		const resolvers = [
			staticResolver({
				transformers: {
					"mock-transform": require("mock-transform"),
				},
			}),
		];
		expect(config.transformSource(resolvers, source)).toMatchInlineSnapshot(`
			[
			  {
			    "column": 1,
			    "data": "transformed source (was: original data)",
			    "filename": "/path/to/test.foo",
			    "line": 1,
			    "offset": 0,
			    "originalData": "original data",
			    "transformedBy": [
			      "mock-transform",
			    ],
			  },
			]
		`);
	});

	it("should use given name when matching transform", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [
				{ pattern: /^.*\.foo$/, name: "mock-transform-foo" },
				{ pattern: /^.*\.bar$/, name: "mock-transform-bar" },
			],
		});
		const resolvers = [
			staticResolver({
				transformers: {
					"mock-transform-foo": require("mock-transform"),
					"mock-transform-bar": require("mock-transform"),
				},
			}),
		];
		expect(config.transformSource(resolvers, source, "/path/to/test.bar")).toMatchInlineSnapshot(`
			[
			  {
			    "column": 1,
			    "data": "transformed source (was: original data)",
			    "filename": "/path/to/test.foo",
			    "line": 1,
			    "offset": 0,
			    "originalData": "original data",
			    "transformedBy": [
			      "mock-transform-bar",
			    ],
			  },
			]
		`);
	});

	it("should return original source if no transformer is found", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [],
		});
		expect(config.transformSource([], source)).toMatchInlineSnapshot(`
			[
			  {
			    "column": 3,
			    "data": "original data",
			    "filename": "/path/to/test.foo",
			    "line": 2,
			    "offset": 4,
			  },
			]
		`);
	});

	it("should support chaining transformer", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [
				{
					pattern: /^.*\.bar$/,
					name: "mock-transform-chain-foo",
				},
				{
					pattern: /^.*\.foo$/,
					name: "mock-transform",
				},
			],
		});
		const resolvers = [
			staticResolver({
				transformers: {
					"mock-transform": require("mock-transform"),
					"mock-transform-chain-foo": require("mock-transform-chain-foo"),
				},
			}),
		];
		source.filename = "/path/to/test.bar";
		expect(config.transformSource(resolvers, source)).toMatchInlineSnapshot(`
			[
			  {
			    "column": 1,
			    "data": "transformed source (was: data from mock-transform-chain-foo (was: original data))",
			    "filename": "/path/to/test.bar",
			    "line": 1,
			    "offset": 0,
			    "originalData": "original data",
			    "transformedBy": [
			      "mock-transform",
			      "mock-transform-chain-foo",
			    ],
			  },
			]
		`);
	});

	it("should support testing if chain is present", () => {
		expect.assertions(2);
		const config = createMockConfig({
			transformers: [
				{
					pattern: /^.*\.foo$/,
					name: "mock-transform-optional-chain",
				},
				{
					pattern: /^.*\.bar$/,
					name: "mock-transform",
				},
			],
		});
		const resolvers = [
			staticResolver({
				transformers: {
					"mock-transform": require("mock-transform"),
					"mock-transform-optional-chain": require("mock-transform-optional-chain"),
				},
			}),
		];
		source.filename = "/path/to/test.bar.foo";
		expect(config.transformSource(resolvers, source)).toMatchInlineSnapshot(`
			[
			  {
			    "column": 1,
			    "data": "transformed source (was: data from mock-transform-optional-chain (was: original data))",
			    "filename": "/path/to/test.bar.foo",
			    "line": 1,
			    "offset": 0,
			    "originalData": "original data",
			    "transformedBy": [
			      "mock-transform",
			      "mock-transform-optional-chain",
			    ],
			  },
			]
		`);
		source.filename = "/path/to/test.baz.foo";
		expect(config.transformSource(resolvers, source)).toEqual([]);
	});

	it("should throw sane error when transformer fails", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [{ pattern: /^.*\.foo$/, name: "mock-transform-error" }],
		});
		const resolvers = [
			staticResolver({
				transformers: {
					"mock-transform-error": require("mock-transform-error"),
				},
			}),
		];
		expect(() => config.transformSource(resolvers, source)).toThrowErrorMatchingInlineSnapshot(
			`"When transforming "/path/to/test.foo": Failed to frobnicate a baz"`,
		);
	});
});

describe("transformFilename()", () => {
	it("should default to reading full file", () => {
		expect.assertions(1);
		const config = createMockConfig();
		expect(config.transformFilename([], "test-files/parser/simple.html")).toMatchInlineSnapshot(`
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
		const source = config.transformFilename([], "/dev/stdin");
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
			transformers: [{ pattern: /^.*\.foo$/, name: "mock-transform" }],
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
