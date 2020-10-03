import { Config } from "../config";
import { ConfigError } from "../config/error";
import { Source } from "../context";
import { HtmlElement } from "../dom";
import { Engine } from "../engine";
import { EventHandler } from "../event";
import { Parser } from "../parser";
import { Rule } from "../rule";
import { Transformer, TRANSFORMER_API } from "../transform";
import { Plugin } from "./plugin";

let mockPlugin: Plugin;
let config: Config;
let source: Source;

jest.mock("mock-plugin", () => ({}), { virtual: true });

describe("Plugin", () => {
	beforeEach(() => {
		/* create source mock */
		source = {
			data: "<p></p>",
			filename: "inline",
			line: 1,
			column: 1,
			offset: 0,
		};

		/* reset mock */
		jest.resetModules();
		mockPlugin = require("mock-plugin");
	});

	it("should throw ConfigError when loading plugin fails", () => {
		expect.assertions(2);
		const loadConfig = (): void => {
			Config.fromObject({ plugins: ["missing-plugin"] });
		};
		expect(loadConfig).toThrow(ConfigError);
		expect(loadConfig).toThrow(/Failed to load plugin "missing-plugin":/);
	});

	describe("name", () => {
		it("should use plugin name if set", () => {
			expect.assertions(1);
			mockPlugin.name = "my-plugin";
			mockPlugin.configs = {
				foo: {
					rules: {
						"my-rule": "error",
					},
				},
			};
			config = Config.fromObject({
				extends: ["my-plugin:foo"],
				plugins: ["mock-plugin"],
			});
			expect(config.get()).toEqual({
				extends: ["my-plugin:foo"],
				plugins: ["mock-plugin"],
				rules: {
					"my-rule": "error",
				},
				transform: {},
			});
		});

		it("should default to package name", () => {
			expect.assertions(1);
			mockPlugin.name = null;
			mockPlugin.configs = {
				foo: {
					rules: {
						"my-rule": "error",
					},
				},
			};
			config = Config.fromObject({
				extends: ["mock-plugin:foo"],
				plugins: ["mock-plugin"],
			});
			expect(config.get()).toEqual({
				extends: ["mock-plugin:foo"],
				plugins: ["mock-plugin"],
				rules: {
					"my-rule": "error",
				},
				transform: {},
			});
		});

		it("should retain original name", () => {
			expect.assertions(1);
			mockPlugin.name = "my-plugin";
			mockPlugin.configs = {
				foo: {
					rules: {
						"my-rule": "error",
					},
				},
			};
			config = Config.fromObject({
				extends: ["mock-plugin:foo"],
				plugins: ["mock-plugin"],
			});
			expect(config.get()).toEqual({
				extends: ["mock-plugin:foo"],
				plugins: ["mock-plugin"],
				rules: {
					"my-rule": "error",
				},
				transform: {},
			});
		});
	});

	describe("configs", () => {
		it("should add extendable predefined configurations", () => {
			expect.assertions(1);
			mockPlugin.configs = {
				foo: {
					rules: {
						"my-rule": "error",
					},
				},
			};
			config = Config.fromObject({
				extends: ["mock-plugin:foo"],
				plugins: ["mock-plugin"],
			});
			expect(config.get()).toEqual({
				extends: ["mock-plugin:foo"],
				plugins: ["mock-plugin"],
				rules: {
					"my-rule": "error",
				},
				transform: {},
			});
		});
	});

	describe("extedMeta", () => {
		it("should not throw error when schema isn't extended", () => {
			expect.assertions(1);
			config = Config.fromObject({
				plugins: ["mock-plugin"],
			});
			expect(() => {
				const metaTable = config.getMetaTable();
				return metaTable.getMetaFor("my-element");
			}).not.toThrow();
		});

		it("should give validation errors when schema isn't extended", () => {
			expect.assertions(1);
			const config = Config.fromObject({
				plugins: ["mock-plugin"],
				elements: [
					{
						"my-element": {
							myMeta: 5,
						},
					},
				],
			});
			expect(() => config.getMetaTable()).not.toThrow(
				"Element metadata is not valid: /my-element Propert myMeta is not expected to be here"
			);
		});

		it("should extend validation schema", () => {
			expect.assertions(1);
			mockPlugin.elementSchema = {
				properties: {
					myMeta: {
						type: "integer",
					},
				},
			};
			config = Config.fromObject({
				plugins: ["mock-plugin"],
				elements: [
					{
						"my-element": {
							myMeta: 5,
						},
					},
				],
			});
			const metaTable = config.getMetaTable();
			const meta = metaTable.getMetaFor("my-element");
			expect(meta).toEqual({
				tagName: "my-element",
				myMeta: 5,
			});
		});

		it("should extend validation schema with definition", () => {
			expect.assertions(1);
			mockPlugin.elementSchema = {
				properties: {
					myMeta: {
						$ref: "#/definitions/myType",
					},
				},
				definitions: {
					myType: {
						type: "integer",
					},
				},
			};
			config = Config.fromObject({
				plugins: ["mock-plugin"],
				elements: [
					{
						"my-element": {
							myMeta: 5,
						},
					},
				],
			});
			const metaTable = config.getMetaTable();
			const meta = metaTable.getMetaFor("my-element");
			expect(meta).toEqual({
				tagName: "my-element",
				myMeta: 5,
			});
		});

		it("should handle definition with missing properties", () => {
			expect.assertions(1);
			mockPlugin.elementSchema = {
				definitions: {
					myType: {
						type: "integer",
					},
				},
			};
			config = Config.fromObject({
				plugins: ["mock-plugin"],
			});
			expect(() => config.getMetaTable()).not.toThrow();
		});

		it("should support copyable properties", () => {
			expect.assertions(1);
			mockPlugin.elementSchema = {
				properties: {
					foo: {
						copyable: true,
					},
					bar: {
						copyable: false,
					},
				},
			};
			config = Config.fromObject({
				plugins: ["mock-plugin"],
				elements: [
					{
						"my-element": {
							foo: "original",
							bar: "original",
						},
						"my-element:real": {
							foo: "copied",
							bar: "copied",
						},
					},
				],
			});
			const metaTable = config.getMetaTable();
			const a = metaTable.getMetaFor("my-element");
			const b = metaTable.getMetaFor("my-element:real");
			const node = new HtmlElement("my-element", null, null, a);
			node.loadMeta(b);
			expect(node.meta).toEqual({
				tagName: "my-element",
				foo: "copied" /* foo is marked for copying */,
				bar: "original" /* bar is not marked for copying */,
			});
		});
	});

	describe("callbacks", () => {
		beforeEach(() => {
			/* initialize config */
			config = Config.fromObject({
				plugins: ["mock-plugin"],
			});
			config.init();
		});

		it("Engine should handle missing plugin callbacks", () => {
			expect.assertions(1);
			expect(() => new Engine(config, Parser)).not.toThrow();
		});

		it("Engine should call plugin init callback", () => {
			expect.assertions(1);
			mockPlugin.init = jest.fn();
			const engine = new Engine(config, Parser);
			engine.lint([source]);
			expect(mockPlugin.init).toHaveBeenCalledWith();
		});

		it("Engine should call plugin setup callback", () => {
			expect.assertions(1);
			mockPlugin.setup = jest.fn();
			const engine = new Engine(config, Parser);
			engine.lint([source]);
			expect(mockPlugin.setup).toHaveBeenCalledWith(source, expect.any(EventHandler));
		});

		it("Parser events should trigger plugin eventhandler", () => {
			expect.assertions(1);
			const handler = jest.fn();
			mockPlugin.setup = (source: Source, eventhandler: EventHandler) => {
				eventhandler.on("dom:ready", handler);
			};
			const engine = new Engine(config, Parser);
			engine.lint([source]);
			expect(handler).toHaveBeenCalledWith("dom:ready", expect.anything());
		});
	});

	describe("rules", () => {
		beforeEach(() => {
			/* initialize config */
			config = Config.fromObject({
				plugins: ["mock-plugin"],
				rules: {
					"mock-rule": ["error", "mock-options"],
				},
			});
			config.init();
		});

		it("Engine should call rule init callback", () => {
			expect.assertions(1);
			const mockRule: Rule = new (class extends Rule {
				public setup(): void {
					/* do nothing */
				}
			})();
			mockPlugin.rules = {
				"mock-rule": null /* instantiateRule is mocked, this can be anything */,
			};
			const setup = jest.spyOn(mockRule, "setup");
			const engine = new Engine(config, Parser);
			jest.spyOn(engine as any, "instantiateRule").mockImplementation(() => mockRule);
			engine.lint([source]);
			expect(setup).toHaveBeenCalledWith();
		});
	});

	describe("transform", () => {
		it("should support exposing unnamed transform", () => {
			expect.assertions(1);
			function transform(source: Source): Source[] {
				return [
					{
						data: "transformed from unnamed transformer",
						filename: source.filename,
						line: source.line,
						column: source.column,
						offset: source.offset,
						originalData: source.data,
					},
				];
			}
			transform.api = TRANSFORMER_API.VERSION;
			mockPlugin.transformer = transform as Transformer;
			config = Config.fromObject({
				plugins: ["mock-plugin"],
				transform: {
					".*": "mock-plugin",
				},
			});
			config.init();
			const sources = config.transformSource({
				data: "original data",
				filename: "/path/to/mock.filename",
				line: 2,
				column: 3,
				offset: 4,
			});
			expect(sources).toMatchInlineSnapshot(`
				Array [
				  Object {
				    "column": 3,
				    "data": "transformed from unnamed transformer",
				    "filename": "/path/to/mock.filename",
				    "line": 2,
				    "offset": 4,
				    "originalData": "original data",
				    "transformedBy": Array [
				      "mock-plugin",
				    ],
				  },
				]
			`);
		});

		it("should support exposing named transform", () => {
			expect.assertions(1);
			function transform(source: Source): Source[] {
				return [
					{
						data: "transformed from named transformer",
						filename: source.filename,
						line: source.line,
						column: source.column,
						offset: source.offset,
						originalData: source.data,
					},
				];
			}
			transform.api = TRANSFORMER_API.VERSION;
			mockPlugin.transformer = {
				foobar: transform as Transformer,
			};
			config = Config.fromObject({
				plugins: ["mock-plugin"],
				transform: {
					".*": "mock-plugin:foobar",
				},
			});
			config.init();
			const sources = config.transformSource({
				data: "original data",
				filename: "/path/to/mock.filename",
				line: 2,
				column: 3,
				offset: 4,
			});
			expect(sources).toMatchInlineSnapshot(`
				Array [
				  Object {
				    "column": 3,
				    "data": "transformed from named transformer",
				    "filename": "/path/to/mock.filename",
				    "line": 2,
				    "offset": 4,
				    "originalData": "original data",
				    "transformedBy": Array [
				      "mock-plugin:foobar",
				    ],
				  },
				]
			`);
		});

		it("should throw error when named transform is missing plugin", () => {
			expect.assertions(1);
			mockPlugin.transformer = {};
			config = Config.fromObject({
				transform: {
					".*": "missing-plugin:foobar",
				},
			});
			expect(() => config.init()).toThrow(
				'Failed to load transformer "missing-plugin:foobar": No plugin named "missing-plugin" has been loaded'
			);
		});

		it("should throw error when named transform is missing", () => {
			expect.assertions(1);
			mockPlugin.transformer = {};
			config = Config.fromObject({
				plugins: ["mock-plugin"],
				transform: {
					".*": "mock-plugin:foobar",
				},
			});
			expect(() => config.init()).toThrow(
				'Failed to load transformer "mock-plugin:foobar": Plugin "mock-plugin" does not expose a transformer named "foobar".'
			);
		});

		it("should throw error when referencing named transformer without name", () => {
			expect.assertions(1);
			mockPlugin.transformer = {
				foobar: null,
			};
			config = Config.fromObject({
				plugins: ["mock-plugin"],
				transform: {
					".*": "mock-plugin",
				},
			});
			expect(() => config.init()).toThrow(
				'Failed to load transformer "mock-plugin": Transformer "mock-plugin" refers to unnamed transformer but plugin exposes only named.'
			);
		});

		it("should throw error when referencing unnamed transformer with name", () => {
			expect.assertions(1);
			mockPlugin.transformer = function transform(): Source[] {
				return [];
			};
			config = Config.fromObject({
				plugins: ["mock-plugin"],
				transform: {
					".*": "mock-plugin:foobar",
				},
			});
			expect(() => config.init()).toThrow(
				'Failed to load transformer "mock-plugin:foobar": Transformer "mock-plugin:foobar" refers to named transformer but plugin exposes only unnamed, use "mock-plugin" instead.'
			);
		});
	});
});
