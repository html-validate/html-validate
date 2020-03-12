import fs from "fs";
import path from "path";
import { Source } from "../context";
import { SchemaValidationError } from "../error";
import { UserError } from "../error/user-error";
import { Transformer, TRANSFORMER_API } from "../transform";
import { Config } from "./config";
import { ConfigError } from "./error";
import { Severity } from "./severity";

let mockElements: any;
jest.mock("mock-elements", () => mockElements, { virtual: true });
jest.mock("mock-plugin", () => ({}), { virtual: true });

/* a mocked file which throws an exception when loaded */
jest.mock(
	"invalid-file.json",
	() => {
		throw new Error("mocked error");
	},
	{ virtual: true }
);

/* mock plugin with config presets */
jest.mock(
	"mock-plugin-presets",
	() => ({
		configs: {
			base: {
				rules: {
					foo: "error",
					bar: "warn",
					baz: "off",
				},
			},
			"no-foo": {
				rules: {
					foo: "off",
				},
			},
		},
	}),
	{ virtual: true }
);

describe("config", () => {
	it("should load defaults", () => {
		expect.assertions(1);
		const config = Config.empty();
		expect(config.get()).toBeDefined();
	});

	it("should contain no rules by default", () => {
		expect.assertions(1);
		const config = Config.empty();
		expect(Object.keys(config.get().rules)).toHaveLength(0);
	});

	it("empty() should load empty config", () => {
		expect.assertions(1);
		const config = Config.empty();
		expect(config.get()).toEqual({
			extends: [],
			rules: {},
			plugins: [],
			transform: {},
		});
	});

	it("defaultConfig() should load defaults", () => {
		expect.assertions(1);
		const config = Config.defaultConfig();
		expect(config.get()).toEqual({
			extends: ["html-validate:recommended"],
			rules: expect.any(Object),
			plugins: [],
			transform: {},
		});
	});

	it("should throw user-error if file is not properly formatted json", () => {
		expect.assertions(2);
		expect(() => Config.fromFile("invalid-file.json")).toThrow(UserError);
		expect(() => Config.fromFile("invalid-file.json")).toThrow(
			'Failed to read configuration from "invalid-file.json"'
		);
	});

	it("should throw error if file is invalid", () => {
		expect.assertions(2);
		expect(() =>
			Config.fromObject({
				rules: "spam",
			} as any)
		).toThrow("Invalid configuration: /rules: type should be object");
		expect(() => Config.fromFile("invalid-file.json")).toThrow(
			'Failed to read configuration from "invalid-file.json"'
		);
	});

	describe("merge()", () => {
		it("should merge two configs", () => {
			expect.assertions(1);
			const a = Config.fromObject({ rules: { foo: 1 } });
			const b = Config.fromObject({ rules: { bar: 1 } });
			const merged = a.merge(b);
			expect(merged.get()).toEqual({
				extends: [],
				rules: {
					foo: 1,
					bar: 1,
				},
				plugins: [],
				transform: {},
			});
		});
	});

	describe("getRules()", () => {
		it("should handle when config is missing rules", () => {
			expect.assertions(2);
			const config = Config.fromObject({ rules: undefined });
			expect(config.get().rules).toEqual({});
			expect(config.getRules()).toEqual(new Map());
		});

		it("should return parsed rules", () => {
			expect.assertions(2);
			const config = Config.fromObject({ rules: { foo: "error" } });
			expect(config.get().rules).toEqual({ foo: "error" });
			expect(Array.from(config.getRules().entries())).toEqual([
				["foo", [Severity.ERROR, {}]],
			]);
		});

		it("should parse severity from string", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				rules: {
					foo: "error",
					bar: "warn",
					baz: "off",
				},
			});
			expect(Array.from(config.getRules().entries())).toEqual([
				["foo", [Severity.ERROR, {}]],
				["bar", [Severity.WARN, {}]],
				["baz", [Severity.DISABLED, {}]],
			]);
		});

		it("should retain severity from integer", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				rules: {
					foo: 2,
					bar: 1,
					baz: 0,
				},
			});
			expect(Array.from(config.getRules().entries())).toEqual([
				["foo", [Severity.ERROR, {}]],
				["bar", [Severity.WARN, {}]],
				["baz", [Severity.DISABLED, {}]],
			]);
		});

		it("should retain options", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				rules: {
					foo: [2, { foo: true }],
					bar: ["error", { bar: false }],
					baz: ["warn"],
				},
			});
			expect(Array.from(config.getRules().entries())).toEqual([
				["foo", [Severity.ERROR, { foo: true }]],
				["bar", [Severity.ERROR, { bar: false }]],
				["baz", [Severity.WARN, {}]],
			]);
		});
	});

	describe("fromFile()", () => {
		it("should support JSON", () => {
			expect.assertions(1);
			const config = Config.fromFile(`${process.cwd()}/test-files/config.json`);
			expect(Array.from(config.getRules().entries())).toEqual([
				["foo", [Severity.ERROR, {}]],
				["bar", [Severity.WARN, {}]],
				["baz", [Severity.DISABLED, {}]],
			]);
		});
	});

	describe("extend", () => {
		it("should extend base configuration", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				extends: [`${process.cwd()}/test-files/config.json`],
				rules: {
					foo: 1,
				},
			});
			expect(Array.from(config.getRules().entries())).toEqual([
				["foo", [Severity.WARN, {}]],
				["bar", [Severity.WARN, {}]],
				["baz", [Severity.DISABLED, {}]],
			]);
		});

		it("should support deep extending", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				extends: [`${process.cwd()}/test-files/config-extending.json`],
			});
			expect(config.getRules()).toEqual(
				new Map([
					["foo", [Severity.ERROR, {}]],
					["bar", [Severity.WARN, {}]],
					["baz", [Severity.ERROR, {}]],
				])
			);
		});

		it("should support html-validate:recommended", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				extends: ["html-validate:recommended"],
			});
			expect(config.getRules()).toBeDefined();
		});

		it("should support htmlvalidate:recommended", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				extends: ["htmlvalidate:recommended"],
			});
			expect(config.getRules()).toBeDefined();
		});

		it("should support html-validate:document", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				extends: ["html-validate:document"],
			});
			expect(config.getRules()).toBeDefined();
		});

		it("should support htmlvalidate:document", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				extends: ["htmlvalidate:document"],
			});
			expect(config.getRules()).toBeDefined();
		});

		it("passed config should have precedence over extended", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				extends: ["mock-plugin-presets:base"],
				plugins: ["mock-plugin-presets"],
				rules: {
					foo: "warn",
					baz: "error",
				},
			});
			expect(config.getRules()).toEqual(
				new Map([
					["foo", [Severity.WARN, {}]],
					["bar", [Severity.WARN, {}]],
					["baz", [Severity.ERROR, {}]],
				])
			);
		});

		it("should be resolved in correct order", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				extends: ["mock-plugin-presets:base", "mock-plugin-presets:no-foo"],
				plugins: ["mock-plugin-presets"],
			});
			expect(config.getRules()).toEqual(
				new Map([
					["foo", [Severity.DISABLED, {}]],
					["bar", [Severity.WARN, {}]],
					["baz", [Severity.DISABLED, {}]],
				])
			);
		});
	});

	describe("expandRelative()", () => {
		it("should expand ./foo", () => {
			expect.assertions(1);
			expect(Config.expandRelative("./foo", "/path")).toEqual(
				path.join(path.sep, "path", "foo")
			);
		});

		it("should expand ../foo", () => {
			expect.assertions(1);
			expect(Config.expandRelative("../foo", "/path/bar")).toEqual(
				path.join(path.sep, "path", "foo")
			);
		});

		it("should not expand /foo", () => {
			expect.assertions(1);
			expect(Config.expandRelative("/foo", "/path")).toEqual("/foo");
		});

		it("should not expand foo", () => {
			expect.assertions(1);
			expect(Config.expandRelative("foo", "/path")).toEqual("foo");
		});
	});

	describe("getMetaTable()", () => {
		it("should load metadata", () => {
			expect.assertions(1);
			const config = Config.empty();
			const metatable = config.getMetaTable();
			expect(Object.keys(metatable.elements)).not.toHaveLength(0);
		});

		it("should load inline metadata", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				elements: [
					{
						foo: {},
					},
				],
			});
			const metatable = config.getMetaTable();
			expect(Object.keys(metatable.elements)).toEqual(["foo"]);
		});

		it("should cache table", () => {
			expect.assertions(1);
			const config = Config.empty();
			const a = config.getMetaTable();
			const b = config.getMetaTable();
			expect(a).toBe(b);
		});

		it("should load metadata from module", () => {
			expect.assertions(1);
			mockElements = {
				foo: {},
			};
			const config = Config.fromObject({
				elements: ["mock-elements"],
			});
			const metatable = config.getMetaTable();
			expect(Object.keys(metatable.elements)).not.toHaveLength(0);
		});

		it("should throw ConfigError when module doesn't exist", () => {
			expect.assertions(2);
			const config = Config.fromObject({
				elements: ["missing-module"],
			});
			expect(() => config.getMetaTable()).toThrow(ConfigError);
			expect(() => config.getMetaTable()).toThrow(
				/Failed to load elements from "missing-module": .*/
			);
		});
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
			const config = Config.fromObject({
				transform: {
					"^.*\\.foo$": "mock-transform",
				},
			});
			config.init();
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

		describe("should handle transformers from plugins", () => {
			let config: Config;

			beforeEach(() => {
				function transform(source: Source): Source[] {
					return [
						Object.assign(source, {
							data: `transformed from ${source.filename}`,
						}),
					];
				}
				transform.api = TRANSFORMER_API.VERSION;
				jest.mock(
					"mock-plugin-unnamed",
					() => ({
						transformer: transform as Transformer,
					}),
					{ virtual: true }
				);
				jest.mock(
					"mock-plugin-named",
					() => ({
						transformer: {
							default: transform as Transformer,
							foobar: transform as Transformer,
						},
					}),
					{ virtual: true }
				);
				config = Config.fromObject({
					plugins: ["mock-plugin-unnamed", "mock-plugin-named"],
					transform: {
						"\\.unnamed$": "mock-plugin-unnamed",
						"\\.default$": "mock-plugin-named",
						"\\.named$": "mock-plugin-named:foobar",
						"\\.nonplugin$": "mock-transform",
					},
				});
				config.init();
			});

			it("unnamed", () => {
				expect.assertions(1);
				source.filename = "foo.unnamed";
				expect(config.transformSource(source)).toMatchInlineSnapshot(`
					Array [
					  Object {
					    "column": 3,
					    "data": "transformed from foo.unnamed",
					    "filename": "foo.unnamed",
					    "line": 2,
					    "offset": 4,
					    "transformedBy": Array [
					      "mock-plugin-unnamed",
					    ],
					  },
					]
				`);
			});

			it("named", () => {
				expect.assertions(1);
				source.filename = "bar.named";
				expect(config.transformSource(source)).toMatchInlineSnapshot(`
					Array [
					  Object {
					    "column": 3,
					    "data": "transformed from bar.named",
					    "filename": "bar.named",
					    "line": 2,
					    "offset": 4,
					    "transformedBy": Array [
					      "mock-plugin-named:foobar",
					    ],
					  },
					]
				`);
			});

			it("unnamed default", () => {
				expect.assertions(1);
				source.filename = "bar.default";
				expect(config.transformSource(source)).toMatchInlineSnapshot(`
					Array [
					  Object {
					    "column": 3,
					    "data": "transformed from bar.default",
					    "filename": "bar.default",
					    "line": 2,
					    "offset": 4,
					    "transformedBy": Array [
					      "mock-plugin-named",
					    ],
					  },
					]
				`);
			});

			it("non-plugin (regression test issue 54)", () => {
				expect.assertions(1);
				source.filename = "bar.nonplugin";
				expect(config.transformSource(source)).toMatchInlineSnapshot(`
					Array [
					  Object {
					    "column": 1,
					    "data": "transformed source (was: original data)",
					    "filename": "bar.nonplugin",
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
		});

		it("should throw error if transformer uses obsolete API", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				transform: {
					"^.*\\.foo$": "mock-transform-obsolete",
				},
			});
			expect(() => config.init()).toThrow(
				/Failed to load transformer "mock-transform-obsolete": Transformer uses API version 0 but only version \d+ is supported/
			);
		});

		it("should throw error if transformer refers to missing plugin", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				transform: {
					"^.*\\.foo$": "missing-plugin:foo",
				},
			});
			expect(() => config.init()).toThrow(
				'Failed to load transformer "missing-plugin:foo": No plugin named "missing-plugin" has been loaded'
			);
		});

		it("should return original source if no transformer is found", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				transform: {
					"^.*\\.bar$": "mock-transform",
				},
			});
			config.init();
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
			const config = Config.fromObject({
				transform: {
					"^.*\\.bar$": "mock-transform-chain-foo",
					"^.*\\.foo$": "mock-transform",
				},
			});
			config.init();
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
			const config = Config.fromObject({
				transform: {
					"^.*\\.foo$": "mock-transform-optional-chain",
					"^.*\\.bar$": "mock-transform",
				},
			});
			config.init();
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

		it("should replace <rootDir>", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				transform: {
					"^.*\\.foo$": "<rootDir>/src/transform/__mocks__/mock-transform",
				},
			});
			config.init();
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
				      "<rootDir>/src/transform/__mocks__/mock-transform",
				    ],
				  },
				]
			`);
		});

		it("should throw sane error when transformer fails", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				transform: {
					"^.*\\.foo$": "mock-transform-error",
				},
			});
			config.init();
			expect(() =>
				config.transformSource(source)
			).toThrowErrorMatchingSnapshot();
		});

		it("should throw sane error when transformer fails to load", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				transform: {
					"^.*\\.foo$":
						"missing-transformer" /* mocked transformer, see top of file */,
				},
			});
			expect(() => config.init()).toThrowErrorMatchingSnapshot();
		});

		it("should throw error when trying to load unnamed transform from plugin without any", () => {
			expect.assertions(1);
			jest.mock("mock-plugin-notransform", () => ({}), { virtual: true });
			const config = Config.fromObject({
				plugins: ["mock-plugin-notransform"],
				transform: {
					"^.*\\.foo$": "mock-plugin-notransform",
				},
			});
			expect(() => config.init()).toThrowErrorMatchingSnapshot();
		});

		it("should throw error when trying to load named transform from plugin without any", () => {
			expect.assertions(1);
			jest.mock("mock-plugin-notransform", () => ({}), { virtual: true });
			const config = Config.fromObject({
				plugins: ["mock-plugin-notransform"],
				transform: {
					"^.*\\.foo$": "mock-plugin-notransform:named",
				},
			});
			expect(() => config.init()).toThrowErrorMatchingSnapshot();
		});

		it("should throw error when trying to load garbage as transformer", () => {
			expect.assertions(1);
			jest.mock("mock-garbage", () => "foobar", { virtual: true });
			const config = Config.fromObject({
				transform: {
					"^.*\\.foo$": "mock-garbage",
				},
			});
			expect(() => config.init()).toThrowErrorMatchingSnapshot();
		});

		it("should throw helpful error when trying to load unregistered plugin as transformer", () => {
			expect.assertions(1);
			jest.mock("mock-plugin-unregistered", () => ({ transformer: {} }), {
				virtual: true,
			});
			const config = Config.fromObject({
				transform: {
					"^.*\\.foo$": "mock-plugin-unregistered",
				},
			});
			expect(() => config.init()).toThrowErrorMatchingSnapshot();
		});
	});

	describe("transformFilename()", () => {
		it("should default to reading full file", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				transform: {
					"^.*\\.foo$": "mock-transform",
				},
			});
			config.init();
			expect(config.transformFilename("test-files/parser/simple.html"))
				.toMatchInlineSnapshot(`
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
		let config: Config;

		beforeEach(() => {
			config = Config.fromObject({
				transform: {
					"^.*\\.foo$": "mock-transform",
				},
			});
			config.init();
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

	describe("init()", () => {
		it("should handle being called multiple times", () => {
			expect.assertions(1);
			const config = Config.fromObject({});
			const spy = jest
				.spyOn(config as any, "precompileTransformers")
				.mockReturnValue([]);
			config.init();
			config.init();
			expect(spy).toHaveBeenCalledTimes(1);
		});

		it("should handle unset fields", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				plugins: undefined,
				transform: undefined,
			});
			expect(() => {
				config.init();
			}).not.toThrow();
		});

		it("should load plugins", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				plugins: ["mock-plugin"],
			});
			config.init();
			expect(config.getPlugins()).toEqual([
				expect.objectContaining({ name: "mock-plugin" }),
			]);
		});
	});

	it("should find rootDir", () => {
		expect.assertions(2);
		const config = new (class extends Config {
			public findRootDir(): string {
				return super.findRootDir();
			}
		})();
		const root = path.resolve(path.join(__dirname, "../.."));
		expect(config.findRootDir()).toEqual(root);
		const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => false);
		expect(config.findRootDir()).toEqual(process.cwd());
		spy.mockRestore();
	});

	describe("schema validation", () => {
		describe("valid", () => {
			it.each([
				["empty", {}],
				["root true", { root: true }],
				["root false", { root: false }],
				["extends empty", { extends: [] }],
				["extends string", { extends: ["foo", "bar", "baz"] }],
				["elements empty", { elements: [] }],
				["elements string", { elements: ["foo", "bar", "baz"] }],
				["plugins empty", { plugins: [] }],
				["plugins string", { plugins: ["foo", "bar", "baz"] }],
				["transform empty", { transform: {} }],
				["transform patterns", { transform: { "^foo$": "bar" } }],
				["rules empty", { rules: {} }],
				["rules with numeric severity", { rules: { foo: 0, bar: 1, baz: 2 } }],
				["rules with severity", { rules: { a: "off", b: "warn", c: "error" } }],
				["rules with missing options", { rules: { foo: ["error"] } }],
				["rules with options", { rules: { foo: ["error", { spam: "ham" }] } }],
			] as Array<[string, any]>)("%s", (_, config: any) => {
				expect(() => Config.validate(config)).not.toThrow();
			});
		});

		describe("invalid", () => {
			it.each([
				["root garbage", { root: "asdf" }],
				["extends garbage", { extends: "asdf" }],
				["extends invalid", { extends: [1] }],
				["elements garbage", { elements: "asdf" }],
				["elements invalid", { elements: [1] }],
				["plugins garbage", { plugins: "asdf" }],
				["plugins invalid", { plugins: [1] }],
				["transform garbage", { transform: "asdf" }],
				["transform invalid", { transform: { foo: 1 } }],
				["rules with invalid numeric severity", { rules: { foo: -1, bar: 3 } }],
				["rules with invalid severity", { rules: { foo: "spam" } }],
				["additional property", { foo: "bar" }],
			] as Array<[string, any]>)("%s", (_, config: any) => {
				expect(() => Config.validate(config)).toThrow(SchemaValidationError);
			});
		});
	});
});
