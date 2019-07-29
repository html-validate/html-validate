import fs from "fs";
import path from "path";
import { UserError } from "../error/user-error";
import { Config } from "./config";
import { Severity } from "./severity";

let mockElements: any;
jest.mock("mock-elements", () => mockElements, { virtual: true });
jest.mock("mock-plugin", () => ({ name: "mock plugin" }), { virtual: true });

/* a mocked file which throws an exception when loaded */
jest.mock(
	"invalid-file.json",
	() => {
		throw new Error("mocked error");
	},
	{ virtual: true }
);

/* mock transformers */
jest.mock(
	"mock-transformer-error",
	() =>
		function mockTranformerError() {
			throw new Error("Failed to frobnicate a baz");
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
		const config = Config.empty();
		expect(config.get()).toBeDefined();
	});

	it("should contain no rules by default", () => {
		const config = Config.empty();
		expect(Object.keys(config.get().rules)).toHaveLength(0);
	});

	it("empty() should load empty config", () => {
		const config = Config.empty();
		expect(config.get()).toEqual({
			extends: [],
			rules: {},
			plugins: [],
			transform: {},
		});
	});

	it("defaultConfig() should load defaults", () => {
		const config = Config.defaultConfig();
		expect(config.get()).toEqual({
			extends: ["htmlvalidate:recommended"],
			rules: expect.any(Object),
			plugins: [],
			transform: {},
		});
	});

	it("should throw user-error if file is not properly formatted json", () => {
		expect(() => Config.fromFile("invalid-file.json")).toThrow(UserError);
		expect(() => Config.fromFile("invalid-file.json")).toThrow(
			'Failed to read configuration from "invalid-file.json"'
		);
	});

	describe("merge()", () => {
		it("should merge two configs", () => {
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
			const config = Config.fromObject({ rules: null });
			expect(config.get().rules).toEqual({});
			expect(config.getRules()).toEqual(new Map());
		});

		it("should return parsed rules", () => {
			const config = Config.fromObject({ rules: { foo: "error" } });
			expect(config.get().rules).toEqual({ foo: "error" });
			expect(Array.from(config.getRules().entries())).toEqual([
				["foo", [Severity.ERROR, {}]],
			]);
		});

		it("should parse severity from string", () => {
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

		it("should throw on invalid severity", () => {
			const fn = Config.fromObject as (options: any) => Config;
			const config = fn({
				rules: {
					bar: "foo",
				},
			});
			expect(() => config.getRules()).toThrow('Invalid severity "foo"');
		});

		it("should retain options", () => {
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

		it("should handle when rules are unset", () => {
			const config = Config.fromObject({ rules: null });
			expect(Array.from(config.getRules().entries())).toEqual([]);
		});
	});

	describe("fromFile()", () => {
		it("should support JSON", () => {
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

		it("should support htmlvalidate:recommended", () => {
			const config = Config.fromObject({
				extends: ["htmlvalidate:recommended"],
			});
			expect(config.getRules()).toBeDefined();
		});

		it("should support htmlvalidate:document", () => {
			const config = Config.fromObject({
				extends: ["htmlvalidate:document"],
			});
			expect(config.getRules()).toBeDefined();
		});

		it("passed config should have precedence over extended", () => {
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
			expect(Config.expandRelative("./foo", "/path")).toEqual(
				path.join(path.sep, "path", "foo")
			);
		});

		it("should expand ../foo", () => {
			expect(Config.expandRelative("../foo", "/path/bar")).toEqual(
				path.join(path.sep, "path", "foo")
			);
		});

		it("should not expand /foo", () => {
			expect(Config.expandRelative("/foo", "/path")).toEqual("/foo");
		});

		it("should not expand foo", () => {
			expect(Config.expandRelative("foo", "/path")).toEqual("foo");
		});
	});

	describe("getMetaTable()", () => {
		it("should load metadata", () => {
			const config = Config.empty();
			const metatable = config.getMetaTable();
			expect(Object.keys(metatable.elements)).not.toHaveLength(0);
		});

		it("should load inline metadata", () => {
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
			const config = Config.empty();
			const a = config.getMetaTable();
			const b = config.getMetaTable();
			expect(a).toBe(b);
		});

		it("should load metadata from module", () => {
			mockElements = {
				foo: {},
			};
			const config = Config.fromObject({
				elements: ["mock-elements"],
			});
			const metatable = config.getMetaTable();
			expect(Object.keys(metatable.elements)).not.toHaveLength(0);
		});
	});

	describe("transform()", () => {
		it("should match filename against transformer", () => {
			const config = Config.fromObject({
				transform: {
					"^.*\\.foo$": "../transform/mock",
				},
			});
			config.init();
			expect(config.transform("/path/to/test.foo")).toEqual([
				{
					data: "mocked source",
					filename: "/path/to/test.foo",
					line: 1,
					column: 1,
					originalData: "mocked original source",
				},
			]);
		});

		it("should replace <rootDir>", () => {
			const config = Config.fromObject({
				transform: {
					"^.*\\.foo$": "<rootDir>/src/transform/mock",
				},
			});
			config.init();
			expect(config.transform("/path/to/test.foo")).toEqual([
				{
					data: "mocked source",
					filename: "/path/to/test.foo",
					line: 1,
					column: 1,
					originalData: "mocked original source",
				},
			]);
		});

		it("should default to reading full file", () => {
			const config = Config.fromObject({
				transform: {
					"^.*\\.foo$": "../transform/mock",
				},
			});
			config.init();
			expect(config.transform("test-files/parser/simple.html")).toEqual([
				{
					data: "<p>Lorem ipsum</p>\n",
					filename: "test-files/parser/simple.html",
					line: 1,
					column: 1,
					originalData: "<p>Lorem ipsum</p>\n",
				},
			]);
		});

		it("should throw sane error when transformer fails ", () => {
			const config = Config.fromObject({
				transform: {
					"^.*\\.foo$":
						"mock-transformer-error" /* mocked transformer, see top of file */,
				},
			});
			config.init();
			expect(() =>
				config.transform("/path/to/test.foo")
			).toThrowErrorMatchingSnapshot();
		});
	});

	describe("init()", () => {
		it("should handle unset fields", () => {
			const config = Config.fromObject({
				plugins: null,
				transform: null,
			});
			expect(() => {
				config.init();
			}).not.toThrow();
		});

		it("should load plugins", () => {
			const config = Config.fromObject({
				plugins: ["mock-plugin"],
			});
			config.init();
			expect(config.getPlugins()).toEqual([{ name: "mock-plugin" }]);
		});
	});

	it("should find rootDir", () => {
		const config = new (class extends Config {
			public findRootDir() {
				return super.findRootDir();
			}
		})();
		const root = path.resolve(path.join(__dirname, "../.."));
		expect(config.findRootDir()).toEqual(root);
		const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => false);
		expect(config.findRootDir()).toEqual(process.cwd());
		spy.mockRestore();
	});
});
