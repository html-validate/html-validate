import { type Source } from "../context";
import { SchemaValidationError } from "../error";
import { UserError } from "../error/user-error";
import { Config } from "./config";
import { ConfigError } from "./error";
import { staticResolver } from "./resolver";
import { Severity } from "./severity";
import { cjsResolver } from "./resolver/nodejs";

/* a mocked file which throws an exception when loaded */
jest.mock(
	"invalid-file.json",
	() => {
		throw new Error("mocked error");
	},
	{ virtual: true },
);

const resolvers = [
	staticResolver({
		plugins: {
			"mock-plugin": {},
			"mock-plugin-presets": {
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
			},
		},
	}),
];

describe("config", () => {
	it("should load defaults", () => {
		expect.assertions(1);
		const config = Config.empty();
		expect(config.get()).toBeDefined();
	});

	it("should contain no rules by default", () => {
		expect.assertions(1);
		const config = Config.empty();
		expect(Object.keys(config.get().rules ?? {})).toHaveLength(0);
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
			extends: [],
			rules: {},
			plugins: [],
			transform: {},
		});
	});

	it("should throw user-error if file is not properly formatted json", () => {
		expect.assertions(2);
		expect(() => Config.fromFile(resolvers, "invalid-file.json")).toThrow(UserError);
		expect(() => Config.fromFile(resolvers, "invalid-file.json")).toThrow(
			'Failed to load configuration from "invalid-file.json"',
		);
	});

	it("should throw error if file is invalid", () => {
		expect.assertions(2);
		expect(() =>
			Config.fromObject(resolvers, {
				rules: "spam",
			} as any),
		).toThrow("Invalid configuration: /rules: type must be object");
		expect(() => Config.fromFile(resolvers, "invalid-file.json")).toThrow(
			'Failed to load configuration from "invalid-file.json"',
		);
	});

	it("should handle missing plugins property", () => {
		expect.assertions(3);
		expect(Config.fromObject(resolvers, {}).getPlugins()).toEqual([]);
		expect(Config.fromObject(resolvers, { plugins: undefined }).getPlugins()).toEqual([]);
		expect(Config.fromObject(resolvers, { plugins: [] }).getPlugins()).toEqual([]);
	});

	it("should handle missing transform property", () => {
		expect.assertions(3);
		expect(Config.fromObject(resolvers, {}).getTransformers()).toEqual([]);
		expect(Config.fromObject(resolvers, { transform: undefined }).getTransformers()).toEqual([]);
		expect(Config.fromObject(resolvers, { transform: {} }).getTransformers()).toEqual([]);
	});

	describe("merge()", () => {
		it("should merge two configs", () => {
			expect.assertions(1);
			const a = Config.fromObject(resolvers, { rules: { foo: 1 } });
			const b = Config.fromObject(resolvers, { rules: { bar: 1 } });
			const merged = a.merge(resolvers, b);
			expect(merged.get()).toEqual(
				expect.objectContaining({
					rules: {
						foo: 1,
						bar: 1,
					},
				}),
			);
		});
	});

	describe("getRules()", () => {
		it("should handle when config is missing rules", () => {
			expect.assertions(2);
			const config = Config.fromObject(resolvers, { rules: undefined });
			expect(config.get().rules).toEqual({});
			expect(config.getRules()).toEqual(new Map());
		});

		it("should return parsed rules", () => {
			expect.assertions(2);
			const config = Config.fromObject(resolvers, { rules: { foo: "error" } });
			expect(config.get().rules).toEqual({ foo: "error" });
			expect(Array.from(config.getRules().entries())).toEqual([["foo", [Severity.ERROR, {}]]]);
		});

		it("should parse severity from string", () => {
			expect.assertions(1);
			const config = Config.fromObject(resolvers, {
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
			const config = Config.fromObject(resolvers, {
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
			const config = Config.fromObject(resolvers, {
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
		it("should support JSON file", () => {
			expect.assertions(1);
			const resolver = cjsResolver();
			const config = Config.fromFile(resolver, "<rootDir>/test-files/config.json");
			expect(Array.from(config.getRules().entries())).toEqual([
				["foo", [Severity.ERROR, {}]],
				["bar", [Severity.WARN, {}]],
				["baz", [Severity.DISABLED, {}]],
			]);
		});

		it("should support js file", () => {
			expect.assertions(1);
			const resolver = cjsResolver();
			const config = Config.fromFile(resolver, "<rootDir>/test-files/config.js");
			expect(Array.from(config.getRules().entries())).toEqual([
				["foo", [Severity.ERROR, {}]],
				["bar", [Severity.WARN, {}]],
				["baz", [Severity.DISABLED, {}]],
			]);
		});

		it("should support js file without extension", () => {
			expect.assertions(1);
			const resolver = cjsResolver();
			const config = Config.fromFile(resolver, "<rootDir>/test-files/config");
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
			const resolver = cjsResolver();
			const config = Config.fromObject(resolver, {
				extends: ["<rootDir>/test-files/config.json"],
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
			const resolver = cjsResolver();
			const config = Config.fromObject(resolver, {
				extends: ["<rootDir>/test-files/config-extending.json"],
			});
			expect(config.getRules()).toEqual(
				new Map([
					["foo", [Severity.ERROR, {}]],
					["bar", [Severity.WARN, {}]],
					["baz", [Severity.ERROR, {}]],
				]),
			);
		});

		it("should support html-validate:recommended", () => {
			expect.assertions(1);
			const config = Config.fromObject(resolvers, {
				extends: ["html-validate:recommended"],
			});
			expect(config.getRules()).toBeDefined();
		});

		it("should support htmlvalidate:recommended (deprecated alias)", () => {
			expect.assertions(1);
			const config = Config.fromObject(resolvers, {
				extends: ["htmlvalidate:recommended"],
			});
			expect(config.getRules()).toBeDefined();
		});

		it("should support html-validate:document", () => {
			expect.assertions(1);
			const config = Config.fromObject(resolvers, {
				extends: ["html-validate:document"],
			});
			expect(config.getRules()).toBeDefined();
		});

		it("should support htmlvalidate:document (deprecated alias)", () => {
			expect.assertions(1);
			const config = Config.fromObject(resolvers, {
				extends: ["htmlvalidate:document"],
			});
			expect(config.getRules()).toBeDefined();
		});

		it("should support htmlvalidate:a11y", () => {
			expect.assertions(1);
			const config = Config.fromObject(resolvers, {
				extends: ["html-validate:a11y"],
			});
			expect(config.getRules()).toBeDefined();
		});

		it("should support htmlvalidate:a17y (deprecated alias)", () => {
			expect.assertions(1);
			const config = Config.fromObject(resolvers, {
				extends: ["html-validate:a17y"],
			});
			expect(config.getRules()).toBeDefined();
		});

		it("passed config should have precedence over extended", () => {
			expect.assertions(1);
			const config = Config.fromObject(resolvers, {
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
				]),
			);
		});

		it("should be resolved in correct order", () => {
			expect.assertions(1);
			const config = Config.fromObject(resolvers, {
				extends: ["mock-plugin-presets:base", "mock-plugin-presets:no-foo"],
				plugins: ["mock-plugin-presets"],
			});
			expect(config.getRules()).toEqual(
				new Map([
					["foo", [Severity.DISABLED, {}]],
					["bar", [Severity.WARN, {}]],
					["baz", [Severity.DISABLED, {}]],
				]),
			);
		});

		it("should resolve elements in correct order", () => {
			expect.assertions(3);
			const resolver = staticResolver({
				elements: {
					"order-a": {
						foo: {
							permittedContent: ["bar"],
						},
					},
					"order-b": {
						bar: {
							permittedContent: ["baz"],
						},
					},
					"order-c": {
						foo: {
							permittedContent: ["baz"],
						},
					},
				},
				plugins: {
					"mock-plugin": {
						configs: {
							"order-a": {
								elements: ["order-a"],
							},
							"order-b": {
								elements: ["order-b"],
							},
						},
					},
				},
			});
			const config = Config.fromObject(resolver, {
				extends: ["mock-plugin:order-a", "mock-plugin:order-b"],
				plugins: ["mock-plugin"],
				elements: ["order-c"],
			});
			const elements = config.get().elements;
			expect(elements).toEqual(["order-a", "order-b", "order-c"]);
			expect(config.getMetaTable().getMetaFor("foo")).toEqual({
				tagName: "foo",
				aria: {
					implicitRole: expect.any(Function),
					naming: expect.any(Function),
				},
				attributes: {},
				focusable: false,
				implicitRole: expect.any(Function),
				permittedContent: ["baz"],
			});
			expect(config.getMetaTable().getMetaFor("bar")).toEqual({
				tagName: "bar",
				aria: {
					implicitRole: expect.any(Function),
					naming: expect.any(Function),
				},
				attributes: {},
				focusable: false,
				implicitRole: expect.any(Function),
				permittedContent: ["baz"],
			});
		});

		it("should handle extends being explicitly set to undefined", () => {
			expect.assertions(1);
			const config = Config.fromObject(resolvers, {
				extends: undefined,
				rules: undefined,
			});
			expect(Array.from(config.getRules().entries())).toEqual([]);
		});
	});

	describe("getMetaTable()", () => {
		it("should load metadata", () => {
			expect.assertions(1);
			const config = Config.empty();
			const metatable = config.getMetaTable();
			expect(metatable.getMetaFor("div")).toBeDefined();
		});

		it("should load inline metadata", () => {
			expect.assertions(2);
			const config = Config.fromObject(resolvers, {
				elements: [
					{
						foo: {},
					},
				],
			});
			const metatable = config.getMetaTable();
			expect(metatable.getMetaFor("div")).toBeNull();
			expect(metatable.getMetaFor("foo")).not.toBeNull();
		});

		it("should cache table", () => {
			expect.assertions(1);
			const config = Config.empty();
			const a = config.getMetaTable();
			const b = config.getMetaTable();
			expect(a).toBe(b);
		});

		it("should load metadata from resolver", () => {
			expect.assertions(2);
			const resolver = staticResolver({
				elements: {
					"mock-elements": {
						foo: {},
					},
				},
			});
			const config = Config.fromObject(resolver, {
				elements: ["mock-elements"],
			});
			const metatable = config.getMetaTable();
			expect(metatable.getMetaFor("div")).toBeNull();
			expect(metatable.getMetaFor("foo")).not.toBeNull();
		});

		it("should throw ConfigError when module doesn't exist", () => {
			expect.assertions(2);
			const config = Config.fromObject(resolvers, {
				elements: ["missing-module"],
			});
			expect(() => config.getMetaTable()).toThrow(ConfigError);
			expect(() => config.getMetaTable()).toThrow(
				/Failed to load elements from "missing-module": .*/,
			);
		});
	});

	it("should load plugin from name", () => {
		expect.assertions(1);
		const config = Config.fromObject(resolvers, {
			plugins: ["mock-plugin"],
		});
		expect(config.getPlugins()).toEqual([expect.objectContaining({ name: "mock-plugin" })]);
	});

	it("should load plugin inline", () => {
		expect.assertions(1);
		const config = Config.fromObject([], {
			plugins: [
				{
					name: "inline-plugin",
				},
				{
					/* anonymous/unnamed plugin */
				},
			],
		});
		expect(config.getPlugins()).toEqual([
			expect.objectContaining({ name: "inline-plugin" }),
			expect.objectContaining({ name: ":unnamedPlugin@2" }),
		]);
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
				["transform function", { transform: { "^foo$": () => [] } }],
				["rules empty", { rules: {} }],
				["rules with numeric severity", { rules: { foo: 0, bar: 1, baz: 2 } }],
				["rules with severity", { rules: { a: "off", b: "warn", c: "error" } }],
				["rules with missing options", { rules: { foo: ["error"] } }],
				["rules with options", { rules: { foo: ["error", { spam: "ham" }] } }],
			] as Array<[string, any]>)("%s", (_, config: any) => {
				expect.assertions(1);
				expect(() => {
					Config.validate(config);
				}).not.toThrow();
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
				expect(() => {
					Config.validate(config);
				}).toThrow(SchemaValidationError);
			});
		});
	});
});

it("should load transformer by name", () => {
	expect.assertions(1);
	function foo(): Source[] {
		return [];
	}
	const resolver = staticResolver({
		transformers: {
			foo,
		},
	});
	const config = Config.fromObject([resolver], {
		transform: {
			".*": "foo",
		},
	});
	expect(config.getTransformers()).toEqual([{ kind: "import", name: "foo", pattern: /.*/ }]);
});

it("should load transformer by function", () => {
	expect.assertions(1);
	function foo(): Source[] {
		return [];
	}
	const config = Config.fromObject([], {
		transform: {
			".*": foo,
		},
	});
	expect(config.getTransformers()).toEqual([{ kind: "function", function: foo, pattern: /.*/ }]);
});
