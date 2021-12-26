import fs from "fs";
import path from "path";
import { Source } from "../context";
import { SchemaValidationError } from "../error";
import { UserError } from "../error/user-error";
import { TRANSFORMER_API } from "../transform";
import { Plugin } from "../plugin";
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
			"order-a": {
				elements: ["order-a"],
			},
			"order-b": {
				elements: ["order-b"],
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
		expect(Object.keys(config.get().rules || {})).toHaveLength(0);
	});

	it("empty() should load empty config", () => {
		expect.assertions(1);
		const config = Config.empty();
		expect(config.get()).toEqual({
			rules: {},
			plugins: [],
			transform: {},
		});
	});

	it("defaultConfig() should load defaults", () => {
		expect.assertions(1);
		const config = Config.defaultConfig();
		expect(config.get()).toEqual({
			rules: {},
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
		).toThrow("Invalid configuration: /rules: type must be object");
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
			expect(Array.from(config.getRules().entries())).toEqual([["foo", [Severity.ERROR, {}]]]);
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
		const fileDir = path.resolve(__dirname, "../../test-files");

		it("should support JSON file", () => {
			expect.assertions(1);
			const config = Config.fromFile(path.join(fileDir, "config.json"));
			expect(Array.from(config.getRules().entries())).toEqual([
				["foo", [Severity.ERROR, {}]],
				["bar", [Severity.WARN, {}]],
				["baz", [Severity.DISABLED, {}]],
			]);
		});

		it("should support js file", () => {
			expect.assertions(1);
			const config = Config.fromFile(path.join(fileDir, "config.js"));
			expect(Array.from(config.getRules().entries())).toEqual([
				["foo", [Severity.ERROR, {}]],
				["bar", [Severity.WARN, {}]],
				["baz", [Severity.DISABLED, {}]],
			]);
		});

		it("should support js file without extension", () => {
			expect.assertions(1);
			const config = Config.fromFile(path.join(fileDir, "config"));
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

		it("should resolve elements in correct order", () => {
			expect.assertions(3);
			jest.mock(
				"order-a",
				() => ({
					foo: {
						permittedContent: ["bar"],
					},
				}),
				{ virtual: true }
			);
			jest.mock(
				"order-b",
				() => ({
					bar: {
						permittedContent: ["baz"],
					},
				}),
				{ virtual: true }
			);
			jest.mock(
				"order-c",
				() => ({
					foo: {
						permittedContent: ["baz"],
					},
				}),
				{ virtual: true }
			);
			const config = Config.fromObject({
				extends: ["mock-plugin-presets:order-a", "mock-plugin-presets:order-b"],
				plugins: ["mock-plugin-presets"],
				elements: ["order-c"],
			});
			const elements = config.get().elements;
			expect(elements).toEqual(["order-a", "order-b", "order-c"]);
			expect(config.getMetaTable().getMetaFor("foo")).toEqual({
				tagName: "foo",
				attributes: {},
				permittedContent: ["baz"],
			});
			expect(config.getMetaTable().getMetaFor("bar")).toEqual({
				tagName: "bar",
				attributes: {},
				permittedContent: ["baz"],
			});
		});
	});

	describe("expandRelative()", () => {
		it("should expand ./foo", () => {
			expect.assertions(1);
			expect(Config.expandRelative("./foo", "/path")).toEqual(path.join(path.sep, "path", "foo"));
		});

		it("should expand ../foo", () => {
			expect.assertions(1);
			expect(Config.expandRelative("../foo", "/path/bar")).toEqual(
				path.join(path.sep, "path", "foo")
			);
		});

		it("should not expand /foo", () => {
			expect.assertions(1);
			expect(Config.expandRelative("/foo", "/path")).toBe("/foo");
		});

		it("should not expand foo", () => {
			expect.assertions(1);
			expect(Config.expandRelative("foo", "/path")).toBe("foo");
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

	describe("transformers", () => {
		it("should load transformer from package", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				transform: {
					"\\.foo$": "mock-transform",
				},
			});
			config.init();
			expect(config.resolveData().transformers).toEqual([
				{ pattern: /\.foo$/, name: "mock-transform", fn: require("mock-transform") },
			]);
		});

		it("should load transformer from path with <rootDir>", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				transform: {
					"\\.foo$": "<rootDir>/src/transform/__mocks__/mock-transform",
				},
			});
			config.init();
			expect(config.resolveData().transformers).toEqual([
				{
					pattern: /\.foo$/,
					name: "<rootDir>/src/transform/__mocks__/mock-transform",
					fn: require("mock-transform"),
				},
			]);
		});

		describe("should load transformers from plugins", () => {
			function transform(): Source[] {
				return [];
			}
			transform.api = TRANSFORMER_API.VERSION;

			beforeEach(() => {
				const unnamedPlugin: Plugin = {
					transformer: transform,
				};
				const namedPlugin: Plugin = {
					transformer: {
						default: transform,
						foobar: transform,
					},
				};
				jest.mock("mock-plugin-unnamed", () => unnamedPlugin, { virtual: true });
				jest.mock("mock-plugin-named", () => namedPlugin, { virtual: true });
			});

			it("unnamed", () => {
				expect.assertions(1);
				const config = Config.fromObject({
					plugins: ["mock-plugin-unnamed"],
					transform: {
						"\\.unnamed$": "mock-plugin-unnamed",
					},
				});
				config.init();
				expect(config.resolveData().transformers).toEqual([
					{
						pattern: /\.unnamed$/,
						name: "mock-plugin-unnamed",
						fn: transform,
					},
				]);
			});

			it("named", () => {
				expect.assertions(1);
				const config = Config.fromObject({
					plugins: ["mock-plugin-named"],
					transform: {
						"\\.named$": "mock-plugin-named:foobar",
					},
				});
				config.init();
				expect(config.resolveData().transformers).toEqual([
					{
						pattern: /\.named$/,
						name: "mock-plugin-named:foobar",
						fn: transform,
					},
				]);
			});

			it("named default", () => {
				expect.assertions(1);
				const config = Config.fromObject({
					plugins: ["mock-plugin-named"],
					transform: {
						"\\.default$": "mock-plugin-named",
					},
				});
				config.init();
				expect(config.resolveData().transformers).toEqual([
					{
						pattern: /\.default$/,
						name: "mock-plugin-named",
						fn: transform,
					},
				]);
			});

			it("non-plugin (regression test issue 54)", () => {
				expect.assertions(1);
				const config = Config.fromObject({
					plugins: ["mock-plugin-unnamed"],
					transform: {
						"\\.unnamed$": "mock-plugin-unnamed",
						"\\.nonplugin$": "mock-transform",
					},
				});
				config.init();
				expect(config.resolveData().transformers).toEqual([
					{
						pattern: /\.unnamed$/,
						name: "mock-plugin-unnamed",
						fn: transform,
					},
					{
						pattern: /\.nonplugin$/,
						name: "mock-transform",
						fn: require("mock-transform"),
					},
				]);
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

		it("should throw sane error when transformer fails to load", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				transform: {
					"^.*\\.foo$": "missing-transformer" /* mocked transformer, see top of file */,
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

	describe("init()", () => {
		it("should handle being called multiple times", () => {
			expect.assertions(1);
			const config = Config.fromObject({});
			const spy = jest.spyOn(config as any, "precompileTransformers").mockReturnValue([]);
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
			expect(config.getPlugins()).toEqual([expect.objectContaining({ name: "mock-plugin" })]);
		});
	});

	describe("rootDir", () => {
		class MockConfig extends Config {
			private cache: string | null = null;

			public findRootDir(): string {
				return super.findRootDir();
			}

			public get rootDirCache(): string | null {
				return this.cache;
			}

			public set rootDirCache(value: string | null) {
				this.cache = value;
			}
		}

		it("should find rootDir by locating package.json", () => {
			expect.assertions(1);
			const config = new MockConfig();
			const root = path.resolve(path.join(__dirname, "../.."));
			expect(config.findRootDir()).toEqual(root);
		});

		it("should default to current working directory if package.json doesn't exist", () => {
			expect.assertions(1);
			const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => false);
			const config = new MockConfig();
			expect(config.findRootDir()).toEqual(process.cwd());
			spy.mockRestore();
		});

		it("should cache result", () => {
			expect.assertions(1);
			const config = new MockConfig();
			const root = path.resolve(path.join(__dirname, "../.."));
			config.findRootDir(); /* force update cache */
			expect(config.rootDirCache).toEqual(root);
		});

		it("should use cached value", () => {
			expect.assertions(1);
			const root = "/path/to/project/root";
			const config = new MockConfig();
			config.rootDirCache = root;
			expect(config.findRootDir()).toEqual(root);
		});
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
				expect.assertions(1);
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
				expect.assertions(1);
				expect(() => Config.validate(config)).toThrow(SchemaValidationError);
			});
		});
	});
});
