import { type Source } from "../context";
import { SchemaValidationError } from "../error";
import { UserError } from "../error/user-error";
import { type Plugin } from "../plugin";
import { Config } from "./config";
import { ConfigError } from "./error";
import { type Resolver, staticResolver } from "./resolver";
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

	it("should handle missing plugins property", async () => {
		expect.assertions(3);
		expect((await Config.fromObject(resolvers, {})).getPlugins()).toEqual([]);
		expect((await Config.fromObject(resolvers, { plugins: undefined })).getPlugins()).toEqual([]);
		expect((await Config.fromObject(resolvers, { plugins: [] })).getPlugins()).toEqual([]);
	});

	it("should return not promise if config is sync", async () => {
		expect.assertions(2);
		const resolver: Resolver = {
			name: "mock-resolver",
			resolvePlugin() {
				return { name: "mock-plugin" };
			},
		};
		const config = Config.fromObject([resolver], { plugins: ["mock-plugin"] });
		expect(config).not.toBeInstanceOf(Promise);
		expect((config as Config).getPlugins()).toEqual([
			expect.objectContaining({ name: "mock-plugin" }),
		]);
	});

	it("should return promise if config is async", async () => {
		expect.assertions(2);
		const resolver: Resolver = {
			name: "mock-resolver",
			resolvePlugin() {
				return Promise.resolve({ name: "mock-plugin" });
			},
		};
		const config = Config.fromObject([resolver], { plugins: ["mock-plugin"] });
		expect(config).toBeInstanceOf(Promise);
		expect((await config).getPlugins()).toEqual([expect.objectContaining({ name: "mock-plugin" })]);
	});

	it("should handle missing transform property", async () => {
		expect.assertions(3);
		expect((await Config.fromObject(resolvers, {})).getTransformers()).toEqual([]);
		expect(
			(await Config.fromObject(resolvers, { transform: undefined })).getTransformers(),
		).toEqual([]);
		expect((await Config.fromObject(resolvers, { transform: {} })).getTransformers()).toEqual([]);
	});

	describe("merge()", () => {
		it("should merge two sync configs", async () => {
			expect.assertions(2);
			const a = await Config.fromObject(resolvers, { rules: { foo: 1 } });
			const b = await Config.fromObject(resolvers, { rules: { bar: 1 } });
			const merged = a.merge(resolvers, b);
			expect(merged).not.toBeInstanceOf(Promise);
			expect((merged as Config).get()).toEqual(
				expect.objectContaining({
					rules: {
						foo: 1,
						bar: 1,
					},
				}),
			);
		});

		it("should merge two async configs", async () => {
			expect.assertions(2);
			const resolver: Resolver = {
				name: "mock-resolver",
				resolvePlugin() {
					return Promise.resolve({ name: "mock-plugin" });
				},
			};
			const a = await Config.fromObject([resolver], { rules: { foo: 1 } });
			const b = await Config.fromObject([resolver], {
				rules: { bar: 1 },
				plugins: ["mock-plugin"],
			});
			const merged = a.merge([resolver], b);
			expect(merged).toBeInstanceOf(Promise);
			expect((await merged).get()).toEqual(
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
		it("should handle when config is missing rules", async () => {
			expect.assertions(2);
			const config = await Config.fromObject(resolvers, { rules: undefined });
			expect(config.get().rules).toEqual({});
			expect(config.getRules()).toEqual(new Map());
		});

		it("should return parsed rules", async () => {
			expect.assertions(2);
			const config = await Config.fromObject(resolvers, { rules: { foo: "error" } });
			expect(config.get().rules).toEqual({ foo: "error" });
			expect(Array.from(config.getRules().entries())).toEqual([["foo", [Severity.ERROR, {}]]]);
		});

		it("should parse severity from string", async () => {
			expect.assertions(1);
			const config = await Config.fromObject(resolvers, {
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

		it("should retain severity from integer", async () => {
			expect.assertions(1);
			const config = await Config.fromObject(resolvers, {
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

		it("should retain options", async () => {
			expect.assertions(1);
			const config = await Config.fromObject(resolvers, {
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
		it("should support JSON file", async () => {
			expect.assertions(1);
			const resolver = cjsResolver();
			const config = await Config.fromFile(resolver, "<rootDir>/test-files/config.json");
			expect(Array.from(config.getRules().entries())).toEqual([
				["foo", [Severity.ERROR, {}]],
				["bar", [Severity.WARN, {}]],
				["baz", [Severity.DISABLED, {}]],
			]);
		});

		it("should support js file", async () => {
			expect.assertions(1);
			const resolver = cjsResolver();
			const config = await Config.fromFile(resolver, "<rootDir>/test-files/config.js");
			expect(Array.from(config.getRules().entries())).toEqual([
				["foo", [Severity.ERROR, {}]],
				["bar", [Severity.WARN, {}]],
				["baz", [Severity.DISABLED, {}]],
			]);
		});

		it("should support js file without extension", async () => {
			expect.assertions(1);
			const resolver = cjsResolver();
			const config = await Config.fromFile(resolver, "<rootDir>/test-files/config");
			expect(Array.from(config.getRules().entries())).toEqual([
				["foo", [Severity.ERROR, {}]],
				["bar", [Severity.WARN, {}]],
				["baz", [Severity.DISABLED, {}]],
			]);
		});
	});

	describe("extend", () => {
		it("should extend base configuration", async () => {
			expect.assertions(1);
			const resolver = cjsResolver();
			const config = await Config.fromObject(resolver, {
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

		it("should support deep extending", async () => {
			expect.assertions(1);
			const resolver = cjsResolver();
			const config = await Config.fromObject(resolver, {
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

		it("should support html-validate:recommended", async () => {
			expect.assertions(1);
			const config = await Config.fromObject(resolvers, {
				extends: ["html-validate:recommended"],
			});
			expect(config.getRules()).toBeDefined();
		});

		it("should support html-validate:document", async () => {
			expect.assertions(1);
			const config = await Config.fromObject(resolvers, {
				extends: ["html-validate:document"],
			});
			expect(config.getRules()).toBeDefined();
		});

		it("should support htmlvalidate:a11y", async () => {
			expect.assertions(1);
			const config = await Config.fromObject(resolvers, {
				extends: ["html-validate:a11y"],
			});
			expect(config.getRules()).toBeDefined();
		});

		it("passed config should have precedence over extended", async () => {
			expect.assertions(1);
			const config = await Config.fromObject(resolvers, {
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

		it("should be resolved in correct order", async () => {
			expect.assertions(1);
			const config = await Config.fromObject(resolvers, {
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

		it("should resolve elements in correct order", async () => {
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
			const config = await Config.fromObject(resolver, {
				extends: ["mock-plugin:order-a", "mock-plugin:order-b"],
				plugins: ["mock-plugin"],
				elements: ["order-c"],
			});
			const elements = config.get().elements;
			const metatable = await config.getMetaTable();
			expect(elements).toEqual(["order-a", "order-b", "order-c"]);
			expect(metatable.getMetaFor("foo")).toEqual(
				expect.objectContaining({
					tagName: "foo",
					permittedContent: ["baz"],
				}),
			);
			expect(metatable.getMetaFor("bar")).toEqual(
				expect.objectContaining({
					tagName: "bar",
					permittedContent: ["baz"],
				}),
			);
		});

		it("should handle extends being explicitly set to undefined", async () => {
			expect.assertions(1);
			const config = await Config.fromObject(resolvers, {
				extends: undefined,
				rules: undefined,
			});
			expect(Array.from(config.getRules().entries())).toEqual([]);
		});
	});

	describe("getMetaTable()", () => {
		it("should load metadata", async () => {
			expect.assertions(1);
			const config = Config.empty();
			const metatable = await config.getMetaTable();
			expect(metatable.getMetaFor("div")).toBeDefined();
		});

		it("should load inline metadata", async () => {
			expect.assertions(2);
			const config = await Config.fromObject(resolvers, {
				elements: [
					{
						foo: {},
					},
				],
			});
			const metatable = await config.getMetaTable();
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

		it("should load metadata from resolver", async () => {
			expect.assertions(2);
			const resolver = staticResolver({
				elements: {
					"mock-elements": {
						foo: {},
					},
				},
			});
			const config = await Config.fromObject(resolver, {
				elements: ["mock-elements"],
			});
			const metatable = await config.getMetaTable();
			expect(metatable.getMetaFor("div")).toBeNull();
			expect(metatable.getMetaFor("foo")).not.toBeNull();
		});

		it("should throw ConfigError when module doesn't exist", async () => {
			expect.assertions(2);
			const config = await Config.fromObject(resolvers, {
				elements: ["missing-module"],
			});
			expect(() => config.getMetaTable()).toThrow(ConfigError);
			expect(() => config.getMetaTable()).toThrow(
				/Failed to load elements from "missing-module": .*/,
			);
		});
	});

	it("should load plugin from name", async () => {
		expect.assertions(1);
		const config = await Config.fromObject(resolvers, {
			plugins: ["mock-plugin"],
		});
		expect(config.getPlugins()).toEqual([expect.objectContaining({ name: "mock-plugin" })]);
	});

	it("should load plugin inline", async () => {
		expect.assertions(1);
		const config = await Config.fromObject([], {
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

	it("should load multiple plugins", async () => {
		expect.assertions(2);
		const resolver: Resolver = {
			name: "mock-resolver",
			resolvePlugin(id): Plugin | null {
				if (id === "foo") {
					return { name: "foo", configs: { recommended: { rules: { foo: "error" } } } };
				} else if (id === "bar") {
					return { configs: { recommended: { rules: { bar: "error" } } } };
				} else {
					return null;
				}
			},
		};
		const config = await Config.fromObject([resolver], {
			plugins: ["foo", "bar"],
			extends: ["foo:recommended", "bar:recommended"],
		});
		expect(config.getPlugins()).toEqual([
			expect.objectContaining({ name: "foo" }),
			expect.objectContaining({ name: "bar" }),
		]);
		expect(config.getRules()).toEqual(
			new Map([
				["foo", [Severity.ERROR, {}]],
				["bar", [Severity.ERROR, {}]],
			]),
		);
	});

	it("should load multiple plugins (async)", async () => {
		expect.assertions(2);
		const resolver: Resolver = {
			name: "mock-resolver",
			resolvePlugin(id): Promise<Plugin | null> {
				if (id === "foo") {
					return Promise.resolve({
						name: "foo",
						configs: { recommended: { rules: { foo: "error" } } },
					});
				} else if (id === "bar") {
					return Promise.resolve({
						configs: { recommended: { rules: { bar: "error" } } },
					});
				} else {
					return Promise.resolve(null);
				}
			},
		};
		const config = await Config.fromObject([resolver], {
			plugins: ["foo", "bar"],
			extends: ["foo:recommended", "bar:recommended"],
		});
		expect(config.getPlugins()).toEqual([
			expect.objectContaining({ name: "foo" }),
			expect.objectContaining({ name: "bar" }),
		]);
		expect(config.getRules()).toEqual(
			new Map([
				["foo", [Severity.ERROR, {}]],
				["bar", [Severity.ERROR, {}]],
			]),
		);
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

it("should load transformer by name", async () => {
	expect.assertions(1);
	function foo(): Source[] {
		return [];
	}
	const resolver = staticResolver({
		transformers: {
			foo,
		},
	});
	const config = await Config.fromObject([resolver], {
		transform: {
			".*": "foo",
		},
	});
	expect(config.getTransformers()).toEqual([{ kind: "import", name: "foo", pattern: /.*/ }]);
});

it("should load transformer by function", async () => {
	expect.assertions(1);
	function foo(): Source[] {
		return [];
	}
	const config = await Config.fromObject([], {
		transform: {
			".*": foo,
		},
	});
	expect(config.getTransformers()).toEqual([{ kind: "function", function: foo, pattern: /.*/ }]);
});
