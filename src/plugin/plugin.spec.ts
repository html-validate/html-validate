import { type Resolver, Config, staticResolver } from "../config";
import { ConfigError } from "../config/error";
import { type Location, type Source } from "../context";
import { HtmlElement } from "../dom";
import { Engine } from "../engine";
import { EventHandler } from "../event";
import { Parser } from "../parser";
import { Rule } from "../rule";
import { type Transformer, TRANSFORMER_API } from "../transform";
import { type Plugin } from "./plugin";

let mockPlugin: Plugin;
let config: Config;
let source: Source;
let resolvers: Resolver[];

const location: Location = {
	filename: "inline",
	line: 1,
	column: 1,
	offset: 0,
	size: 1,
};

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

		mockPlugin = {};
		resolvers = [
			staticResolver({
				plugins: {
					"mock-plugin": mockPlugin,
				},
			}),
		];
	});

	it("should throw ConfigError when loading plugin fails", () => {
		expect.assertions(2);
		const loadConfig = (): void => {
			Config.fromObject(resolvers, { plugins: ["missing-plugin"] });
		};
		expect(loadConfig).toThrow(ConfigError);
		expect(loadConfig).toThrow(/Failed to load plugin "missing-plugin":/);
	});

	describe("name", () => {
		it("should use plugin name if set", async () => {
			expect.assertions(1);
			mockPlugin.name = "my-plugin";
			mockPlugin.configs = {
				foo: {
					rules: {
						"my-rule": "error",
					},
				},
			};
			config = await Config.fromObject(resolvers, {
				extends: ["my-plugin:foo"],
				plugins: ["mock-plugin"],
			});
			expect(config.get()).toEqual(
				expect.objectContaining({
					plugins: ["mock-plugin"],
					rules: {
						"my-rule": "error",
					},
				}),
			);
		});

		it("should default to package name", async () => {
			expect.assertions(1);
			mockPlugin.name = null;
			mockPlugin.configs = {
				foo: {
					rules: {
						"my-rule": "error",
					},
				},
			};
			config = await Config.fromObject(resolvers, {
				extends: ["mock-plugin:foo"],
				plugins: ["mock-plugin"],
			});
			expect(config.get()).toEqual(
				expect.objectContaining({
					plugins: ["mock-plugin"],
					rules: {
						"my-rule": "error",
					},
				}),
			);
		});

		it("should retain original name", async () => {
			expect.assertions(1);
			mockPlugin.name = "my-plugin";
			mockPlugin.configs = {
				foo: {
					rules: {
						"my-rule": "error",
					},
				},
			};
			config = await Config.fromObject(resolvers, {
				extends: ["mock-plugin:foo"],
				plugins: ["mock-plugin"],
			});
			expect(config.get()).toEqual(
				expect.objectContaining({
					plugins: ["mock-plugin"],
					rules: {
						"my-rule": "error",
					},
				}),
			);
		});
	});

	describe("configs", () => {
		it("should add extendable predefined configurations", async () => {
			expect.assertions(1);
			mockPlugin.configs = {
				foo: {
					rules: {
						"my-rule": "error",
					},
				},
			};
			config = await Config.fromObject(resolvers, {
				extends: ["mock-plugin:foo"],
				plugins: ["mock-plugin"],
			});
			expect(config.get()).toEqual(
				expect.objectContaining({
					plugins: ["mock-plugin"],
					rules: {
						"my-rule": "error",
					},
				}),
			);
		});

		it("should handle config being set to null", async () => {
			expect.assertions(1);
			mockPlugin.configs = {
				foo: null,
			};
			config = await Config.fromObject(resolvers, {
				plugins: ["mock-plugin"],
			});
			expect(config.get()).toEqual(
				expect.objectContaining({
					plugins: ["mock-plugin"],
				}),
			);
		});
	});

	describe("extedMeta", () => {
		it("should not throw error when schema isn't extended", async () => {
			expect.assertions(1);
			config = await Config.fromObject(resolvers, {
				plugins: ["mock-plugin"],
			});
			expect(() => {
				const metaTable = config.getMetaTable();
				return metaTable.getMetaFor("my-element");
			}).not.toThrow();
		});

		it("should give validation errors when schema isn't extended", async () => {
			expect.assertions(1);
			config = await Config.fromObject(resolvers, {
				plugins: ["mock-plugin"],
				elements: [
					{
						"my-element": {
							myMeta: 5,
						},
					},
				],
			});
			expect(() => config.getMetaTable()).toThrow(
				"Element metadata is not valid: /my-element Property myMeta is not expected to be here",
			);
		});

		it("should extend validation schema", async () => {
			expect.assertions(1);
			mockPlugin.elementSchema = {
				properties: {
					myMeta: {
						type: "integer",
					},
				},
			};
			config = await Config.fromObject(resolvers, {
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
				aria: {
					implicitRole: expect.any(Function),
					naming: expect.any(Function),
				},
				attributes: {},
				focusable: false,
				implicitRole: expect.any(Function),
				myMeta: 5,
			});
		});

		it("should extend validation schema with definition", async () => {
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
			config = await Config.fromObject(resolvers, {
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
				aria: {
					implicitRole: expect.any(Function),
					naming: expect.any(Function),
				},
				attributes: {},
				focusable: false,
				implicitRole: expect.any(Function),
				myMeta: 5,
			});
		});

		it("should handle definition with missing properties", async () => {
			expect.assertions(1);
			mockPlugin.elementSchema = {
				definitions: {
					myType: {
						type: "integer",
					},
				},
			};
			config = await Config.fromObject(resolvers, {
				plugins: ["mock-plugin"],
			});
			expect(() => config.getMetaTable()).not.toThrow();
		});

		it("should support copyable properties", async () => {
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
			config = await Config.fromObject(resolvers, {
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
			const node = HtmlElement.createElement("my-element", location, { meta: a });
			node.loadMeta(b!);
			expect(node.meta).toEqual({
				tagName: "my-element",
				aria: {
					implicitRole: expect.any(Function),
					naming: expect.any(Function),
				},
				attributes: {},
				focusable: false,
				implicitRole: expect.any(Function),
				foo: "copied" /* foo is marked for copying */,
				bar: "original" /* bar is not marked for copying */,
			});
		});
	});

	describe("callbacks", () => {
		beforeEach(async () => {
			/* initialize config */
			config = await Config.fromObject(resolvers, {
				plugins: ["mock-plugin"],
			});
		});

		it("Engine should handle missing plugin callbacks", () => {
			expect.assertions(1);
			expect(() => new Engine(config.resolve(), Parser)).not.toThrow();
		});

		it("Engine should call plugin init callback", () => {
			expect.assertions(1);
			mockPlugin.init = jest.fn();
			const engine = new Engine(config.resolve(), Parser);
			engine.lint([source]);
			expect(mockPlugin.init).toHaveBeenCalledWith();
		});

		it("Engine should call plugin setup callback", () => {
			expect.assertions(1);
			mockPlugin.setup = jest.fn();
			const engine = new Engine(config.resolve(), Parser);
			engine.lint([source]);
			expect(mockPlugin.setup).toHaveBeenCalledWith(source, expect.any(EventHandler));
		});

		it("Parser events should trigger plugin eventhandler", () => {
			expect.assertions(1);
			const handler = jest.fn();
			mockPlugin.setup = (source: Source, eventhandler: EventHandler) => {
				eventhandler.on("dom:ready", handler);
			};
			const engine = new Engine(config.resolve(), Parser);
			engine.lint([source]);
			expect(handler).toHaveBeenCalledWith("dom:ready", expect.anything());
		});
	});

	describe("rules", () => {
		beforeEach(async () => {
			/* initialize config */
			config = await Config.fromObject(resolvers, {
				plugins: ["mock-plugin"],
				rules: {
					"mock-rule": ["error", "mock-options"],
				},
			});
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
			const engine = new Engine(config.resolve(), Parser);
			jest.spyOn(engine as any, "instantiateRule").mockImplementation(() => mockRule);
			engine.lint([source]);
			expect(setup).toHaveBeenCalledWith();
		});
	});

	describe("transform", () => {
		it("should support exposing unnamed transform", async () => {
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
			config = await Config.fromObject(resolvers, {
				plugins: ["mock-plugin"],
				transform: {
					".*": "mock-plugin",
				},
			});
			const resolvedConfig = config.resolve();
			const sources = await resolvedConfig.transformSource(resolvers, {
				data: "original data",
				filename: "/path/to/mock.filename",
				line: 2,
				column: 3,
				offset: 4,
			});
			expect(sources).toMatchInlineSnapshot(`
				[
				  {
				    "column": 3,
				    "data": "transformed from unnamed transformer",
				    "filename": "/path/to/mock.filename",
				    "line": 2,
				    "offset": 4,
				    "originalData": "original data",
				    "transformedBy": [
				      "mock-plugin",
				    ],
				  },
				]
			`);
		});

		it("should support exposing named transform", async () => {
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
			config = await Config.fromObject(resolvers, {
				plugins: ["mock-plugin"],
				transform: {
					".*": "mock-plugin:foobar",
				},
			});
			const resolvedConfig = config.resolve();
			const sources = await resolvedConfig.transformSource(resolvers, {
				data: "original data",
				filename: "/path/to/mock.filename",
				line: 2,
				column: 3,
				offset: 4,
			});
			expect(sources).toMatchInlineSnapshot(`
				[
				  {
				    "column": 3,
				    "data": "transformed from named transformer",
				    "filename": "/path/to/mock.filename",
				    "line": 2,
				    "offset": 4,
				    "originalData": "original data",
				    "transformedBy": [
				      "mock-plugin:foobar",
				    ],
				  },
				]
			`);
		});
	});
});
