import { Source } from "../context";
import { MetaTable } from "../meta";
import { ResolvedConfig, ResolvedConfigData } from "./resolved-config";

function createMockConfig(config: Partial<ResolvedConfigData>): ResolvedConfig {
	const metaTable = new MetaTable();
	const defaults: ResolvedConfigData = {
		metaTable,
		plugins: [],
		rules: new Map(),
		transformers: [],
	};
	return new ResolvedConfig({ ...defaults, ...config });
}

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
			transformers: [
				{ pattern: /^.*\.foo$/, name: "mock-transform", fn: require("mock-transform") },
			],
		});
		expect(config.transformSource(source)).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "column": 1,
			    "data": "transformed source (was: original data)",
			    "filename": "/path/to/test.foo",
			    "line": 1,
			    "offset": 0,
			    "originalData": "original data",
			    "transformedBy": Array [
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
				{ pattern: /^.*\.foo$/, name: "mock-transform-foo", fn: require("mock-transform") },
				{ pattern: /^.*\.bar$/, name: "mock-transform-bar", fn: require("mock-transform") },
			],
		});
		expect(config.transformSource(source, "/path/to/test.bar")).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "column": 1,
			    "data": "transformed source (was: original data)",
			    "filename": "/path/to/test.foo",
			    "line": 1,
			    "offset": 0,
			    "originalData": "original data",
			    "transformedBy": Array [
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
		expect(config.transformSource(source)).toMatchInlineSnapshot(`
			Array [
			  Object {
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
					fn: require("mock-transform-chain-foo"),
				},
				{
					pattern: /^.*\.foo$/,
					name: "mock-transform",
					fn: require("mock-transform"),
				},
			],
		});
		source.filename = "/path/to/test.bar";
		expect(config.transformSource(source)).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "column": 1,
			    "data": "transformed source (was: data from mock-transform-chain-foo (was: original data))",
			    "filename": "/path/to/test.bar",
			    "line": 1,
			    "offset": 0,
			    "originalData": "original data",
			    "transformedBy": Array [
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
					fn: require("mock-transform-optional-chain"),
				},
				{
					pattern: /^.*\.bar$/,
					name: "mock-transform",
					fn: require("mock-transform"),
				},
			],
		});
		source.filename = "/path/to/test.bar.foo";
		expect(config.transformSource(source)).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "column": 1,
			    "data": "transformed source (was: data from mock-transform-optional-chain (was: original data))",
			    "filename": "/path/to/test.bar.foo",
			    "line": 1,
			    "offset": 0,
			    "originalData": "original data",
			    "transformedBy": Array [
			      "mock-transform",
			      "mock-transform-optional-chain",
			    ],
			  },
			]
		`);
		source.filename = "/path/to/test.baz.foo";
		expect(config.transformSource(source)).toEqual([]);
	});

	it("should throw sane error when transformer fails", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [
				{ pattern: /^.*\.foo$/, name: "mock-transform-error", fn: require("mock-transform-error") },
			],
		});
		expect(() => config.transformSource(source)).toThrowErrorMatchingInlineSnapshot(
			`"When transforming \\"/path/to/test.foo\\": Failed to frobnicate a baz"`
		);
	});
});

describe("transformFilename()", () => {
	it("should default to reading full file", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [
				{ pattern: /^.*\.foo$/, name: "mock-transform", fn: require("mock-transform") },
			],
		});
		expect(config.transformFilename("test-files/parser/simple.html")).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "column": 1,
			    "data": "<p>Lorem ipsum</p>
			",
			    "filename": "test-files/parser/simple.html",
			    "line": 1,
			    "offset": 0,
			    "originalData": "<p>Lorem ipsum</p>
			",
			  },
			]
		`);
	});
});

describe("canTransform()", () => {
	let config: ResolvedConfig;

	beforeEach(() => {
		config = createMockConfig({
			transformers: [
				{ pattern: /^.*\.foo$/, name: "mock-transform", fn: require("mock-transform") },
			],
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
