/* eslint-disable @typescript-eslint/no-require-imports -- technical debt */

import { type Source } from "../context";
import { MetaTable } from "../meta";
import { type ResolvedConfigData, ResolvedConfig, type Resolver, staticResolver } from "../config";
import { transformSource, transformSourceSync } from "./transform-source";

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

	it("should match filename against named transformer", async () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [{ kind: "import", pattern: /^.*\.foo$/, name: "mock-transform" }],
		});
		const resolvers = [
			staticResolver({
				transformers: {
					"mock-transform": require("mock-transform"),
				},
			}),
		];
		const result = await transformSource(resolvers, config, source);
		expect(result).toMatchInlineSnapshot(`
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

	it("should match filename against function transformer", async () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [
				{ kind: "function", pattern: /^.*\.foo$/, function: require("mock-transform") },
			],
		});
		const result = await transformSource([], config, source);
		expect(result).toMatchInlineSnapshot(`
			[
			  {
			    "column": 1,
			    "data": "transformed source (was: original data)",
			    "filename": "/path/to/test.foo",
			    "line": 1,
			    "offset": 0,
			    "originalData": "original data",
			    "transformedBy": [
			      "mockTransform",
			    ],
			  },
			]
		`);
	});

	it("should use given name when matching transform", async () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [
				{ kind: "import", pattern: /^.*\.foo$/, name: "mock-transform-foo" },
				{ kind: "import", pattern: /^.*\.bar$/, name: "mock-transform-bar" },
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
		const result = await transformSource(resolvers, config, source, "/path/to/test.bar");
		expect(result).toMatchInlineSnapshot(`
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

	it("should return original source if no transformer is found", async () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [],
		});
		const result = await transformSource([], config, source);
		expect(result).toMatchInlineSnapshot(`
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

	it("should handle transformer returning single source", async () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [{ kind: "import", pattern: /^.*\.foo$/, name: "single-source" }],
		});
		function transform(source: Source): Source {
			return source;
		}
		transform.api = 1;
		const resolver = staticResolver({ transformers: { "single-source": transform } });
		const result = await transformSource([resolver], config, source);
		expect(result).toMatchInlineSnapshot(`
			[
			  {
			    "column": 3,
			    "data": "original data",
			    "filename": "/path/to/test.foo",
			    "line": 2,
			    "offset": 4,
			    "transformedBy": [
			      "single-source",
			    ],
			  },
			]
		`);
	});

	it("should handle transformer returning array of sources", async () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [{ kind: "import", pattern: /^.*\.foo$/, name: "single-source" }],
		});
		function transform(source: Source): Source[] {
			return [source];
		}
		transform.api = 1;
		const resolver = staticResolver({ transformers: { "single-source": transform } });
		const result = await transformSource([resolver], config, source);
		expect(result).toMatchInlineSnapshot(`
			[
			  {
			    "column": 3,
			    "data": "original data",
			    "filename": "/path/to/test.foo",
			    "line": 2,
			    "offset": 4,
			    "transformedBy": [
			      "single-source",
			    ],
			  },
			]
		`);
	});

	it("should support chaining transformer", async () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [
				{
					kind: "import",
					pattern: /^.*\.bar$/,
					name: "mock-transform-chain-foo",
				},
				{
					kind: "import",
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
		const result = await transformSource(resolvers, config, source);
		expect(result).toMatchInlineSnapshot(`
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

	it("should support testing if chain is present", async () => {
		expect.assertions(2);
		const config = createMockConfig({
			transformers: [
				{
					kind: "import",
					pattern: /^.*\.foo$/,
					name: "mock-transform-optional-chain",
				},
				{
					kind: "import",
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
		const result1 = await transformSource(resolvers, config, source);
		expect(result1).toMatchInlineSnapshot(`
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
		const result2 = await transformSource(resolvers, config, source);
		expect(result2).toEqual([]);
	});

	it("should throw sane error when transformer fails", async () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [{ kind: "import", pattern: /^.*\.foo$/, name: "mock-transform-error" }],
		});
		const resolvers = [
			staticResolver({
				transformers: {
					"mock-transform-error": require("mock-transform-error"),
				},
			}),
		];
		return expect(() =>
			transformSource(resolvers, config, source),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`"When transforming "/path/to/test.foo": Failed to frobnicate a baz"`,
		);
	});
});

describe("transformSourceSync()", () => {
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

	it("should match filename against named transformer", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [{ kind: "import", pattern: /^.*\.foo$/, name: "mock-transform" }],
		});
		const resolvers = [
			staticResolver({
				transformers: {
					"mock-transform": require("mock-transform"),
				},
			}),
		];
		const result = transformSourceSync(resolvers, config, source);
		expect(result).toMatchInlineSnapshot(`
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

	it("should match filename against function transformer", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [
				{ kind: "function", pattern: /^.*\.foo$/, function: require("mock-transform") },
			],
		});
		const result = transformSourceSync([], config, source);
		expect(result).toMatchInlineSnapshot(`
			[
			  {
			    "column": 1,
			    "data": "transformed source (was: original data)",
			    "filename": "/path/to/test.foo",
			    "line": 1,
			    "offset": 0,
			    "originalData": "original data",
			    "transformedBy": [
			      "mockTransform",
			    ],
			  },
			]
		`);
	});

	it("should use given name when matching transform", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [
				{ kind: "import", pattern: /^.*\.foo$/, name: "mock-transform-foo" },
				{ kind: "import", pattern: /^.*\.bar$/, name: "mock-transform-bar" },
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
		const result = transformSourceSync(resolvers, config, source, "/path/to/test.bar");
		expect(result).toMatchInlineSnapshot(`
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
		const result = transformSourceSync([], config, source);
		expect(result).toMatchInlineSnapshot(`
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

	it("should handle transformer returning single source", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [{ kind: "import", pattern: /^.*\.foo$/, name: "single-source" }],
		});
		function transform(source: Source): Source {
			return source;
		}
		transform.api = 1;
		const resolver = staticResolver({ transformers: { "single-source": transform } });
		const result = transformSourceSync([resolver], config, source);
		expect(result).toMatchInlineSnapshot(`
			[
			  {
			    "column": 3,
			    "data": "original data",
			    "filename": "/path/to/test.foo",
			    "line": 2,
			    "offset": 4,
			    "transformedBy": [
			      "single-source",
			    ],
			  },
			]
		`);
	});

	it("should handle transformer returning array of sources", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [{ kind: "import", pattern: /^.*\.foo$/, name: "single-source" }],
		});
		function transform(source: Source): Source[] {
			return [source];
		}
		transform.api = 1;
		const resolver = staticResolver({ transformers: { "single-source": transform } });
		const result = transformSourceSync([resolver], config, source);
		expect(result).toMatchInlineSnapshot(`
			[
			  {
			    "column": 3,
			    "data": "original data",
			    "filename": "/path/to/test.foo",
			    "line": 2,
			    "offset": 4,
			    "transformedBy": [
			      "single-source",
			    ],
			  },
			]
		`);
	});

	it("should support chaining transformer", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [
				{
					kind: "import",
					pattern: /^.*\.bar$/,
					name: "mock-transform-chain-foo",
				},
				{
					kind: "import",
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
		const result = transformSourceSync(resolvers, config, source);
		expect(result).toMatchInlineSnapshot(`
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
					kind: "import",
					pattern: /^.*\.foo$/,
					name: "mock-transform-optional-chain",
				},
				{
					kind: "import",
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
		const result1 = transformSourceSync(resolvers, config, source);
		expect(result1).toMatchInlineSnapshot(`
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
		const result2 = transformSourceSync(resolvers, config, source);
		expect(result2).toEqual([]);
	});

	it("should throw sane error when transformer fails", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [{ kind: "import", pattern: /^.*\.foo$/, name: "mock-transform-error" }],
		});
		const resolvers = [
			staticResolver({
				transformers: {
					"mock-transform-error": require("mock-transform-error"),
				},
			}),
		];
		expect(() => transformSourceSync(resolvers, config, source)).toThrowErrorMatchingInlineSnapshot(
			`"When transforming "/path/to/test.foo": Failed to frobnicate a baz"`,
		);
	});

	it("should throw error when transformer is loaded async", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [{ kind: "import", pattern: /^.*\.foo$/, name: "async-transformer" }],
		});
		function transform(): Source[] {
			return [];
		}
		transform.api = 1;
		const resolvers: Resolver[] = [
			{
				name: "mock-resolver",
				resolveTransformer() {
					return Promise.resolve(transform);
				},
			},
		];
		expect(() => transformSourceSync(resolvers, config, source)).toThrowErrorMatchingInlineSnapshot(
			`"Cannot use async transformer from sync function"`,
		);
	});

	it("should throw error when transformer returns async result", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [{ kind: "import", pattern: /^.*\.foo$/, name: "async-transformer" }],
		});
		function transform(): Promise<Source[]> {
			return Promise.resolve([]);
		}
		transform.api = 1;
		const resolvers: Resolver[] = [
			{
				name: "mock-resolver",
				resolveTransformer() {
					return transform;
				},
			},
		];
		expect(() => transformSourceSync(resolvers, config, source)).toThrowErrorMatchingInlineSnapshot(
			`"When transforming "/path/to/test.foo": Cannot use async transformer from sync function"`,
		);
	});

	it("should throw error when transformer returns array of  async results", () => {
		expect.assertions(1);
		const config = createMockConfig({
			transformers: [{ kind: "import", pattern: /^.*\.foo$/, name: "async-transformer" }],
		});
		function transform(source: Source): Iterable<Promise<Source>> {
			return [Promise.resolve(source)];
		}
		transform.api = 1;
		const resolvers: Resolver[] = [
			{
				name: "mock-resolver",
				resolveTransformer() {
					return transform;
				},
			},
		];
		expect(() => transformSourceSync(resolvers, config, source)).toThrowErrorMatchingInlineSnapshot(
			`"When transforming "/path/to/test.foo": Cannot use async transformer from sync function"`,
		);
	});
});
