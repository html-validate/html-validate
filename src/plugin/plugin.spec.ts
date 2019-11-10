import { Config } from "../config";
import { Source } from "../context";
import { Engine } from "../engine";
import { NestedError } from "../error";
import { EventHandler } from "../event";
import { Parser } from "../parser";
import { Rule } from "../rule";
import { Transformer } from "../transform";
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
		};

		/* reset mock */
		mockPlugin = require("mock-plugin");
	});

	describe("configs", () => {
		it("should add extendable predefined configurations", () => {
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
			config = Config.fromObject({
				plugins: ["mock-plugin"],
			});
			expect(() => {
				const metaTable = config.getMetaTable();
				return metaTable.getMetaFor("my-element");
			}).not.toThrow();
		});

		it("should give validation errors when schema isn't extended", () => {
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
				void: false,
			});
		});

		it("should extend validation schema with definition", () => {
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
				void: false,
			});
		});

		it("should handle definition with missing properties", () => {
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
			expect(() => new Engine(config, Parser)).not.toThrow();
		});

		it("Engine should call plugin init callback", () => {
			mockPlugin.init = jest.fn();
			const engine = new Engine(config, Parser);
			engine.lint([source]);
			expect(mockPlugin.init).toHaveBeenCalledWith();
		});

		it("Engine should call plugin setup callback", () => {
			mockPlugin.setup = jest.fn();
			const engine = new Engine(config, Parser);
			engine.lint([source]);
			expect(mockPlugin.setup).toHaveBeenCalledWith(
				source,
				expect.any(EventHandler)
			);
		});

		it("Parser events should trigger plugin eventhandler", () => {
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
			const mockRule: Rule = new (class extends Rule {
				public setup(): void {
					/* do nothing */
				}
			})({});
			mockPlugin.rules = {
				"mock-rule": null /* instantiateRule is mocked, this can be anything */,
			};
			const setup = jest.spyOn(mockRule, "setup");
			const engine = new Engine(config, Parser);
			jest
				.spyOn(engine as any, "instantiateRule")
				.mockImplementation(() => mockRule);
			engine.lint([source]);
			expect(setup).toHaveBeenCalledWith();
		});
	});

	describe("transform", () => {
		it("should support exposing unnamed transform", () => {
			expect.assertions(1);
			mockPlugin.transformer = function transform(source: Source): Source[] {
				return [
					{
						data: "transformed from unnamed transformer",
						filename: source.filename,
						line: source.line,
						column: source.column,
						originalData: source.data,
					},
				];
			} as Transformer;
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
			});
			expect(sources).toMatchInlineSnapshot(`
				Array [
				  Object {
				    "column": 3,
				    "data": "transformed from unnamed transformer",
				    "filename": "/path/to/mock.filename",
				    "line": 2,
				    "originalData": "original data",
				  },
				]
			`);
		});

		it("should support exposing named transform", () => {
			expect.assertions(1);
			mockPlugin.transformer = {
				foobar: function transform(source: Source): Source[] {
					return [
						{
							data: "transformed from named transformer",
							filename: source.filename,
							line: source.line,
							column: source.column,
							originalData: source.data,
						},
					];
				} as Transformer,
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
			});
			expect(sources).toMatchInlineSnapshot(`
				Array [
				  Object {
				    "column": 3,
				    "data": "transformed from named transformer",
				    "filename": "/path/to/mock.filename",
				    "line": 2,
				    "originalData": "original data",
				  },
				]
			`);
		});

		it("should throw error when named transform is missing", () => {
			expect.assertions(3);
			mockPlugin.transformer = {};
			config = Config.fromObject({
				plugins: ["mock-plugin"],
				transform: {
					".*": "mock-plugin:foobar",
				},
			});
			try {
				config.init();
			} catch (err) {
				/* need to test NestedError to ensure the error messsage is sane */
				/* eslint-disable jest/no-try-expect */
				expect(err).toBeInstanceOf(NestedError);
				expect(err.message).toContain(
					'Failed to load transformer "mock-plugin:foobar"'
				);
				expect(err.stack).toContain(
					'Plugin "mock-plugin" does not expose a transformer named "foobar".'
				);
				/* eslint-enable jest/no-try-expect */
			}
		});

		it("should throw error when referencing named transformer without name", () => {
			expect.assertions(3);
			mockPlugin.transformer = {
				foobar: null,
			};
			config = Config.fromObject({
				plugins: ["mock-plugin"],
				transform: {
					".*": "mock-plugin",
				},
			});
			try {
				config.init();
			} catch (err) {
				/* need to test NestedError to ensure the error messsage is sane */
				/* eslint-disable jest/no-try-expect */
				expect(err).toBeInstanceOf(NestedError);
				expect(err.message).toContain(
					'Failed to load transformer "mock-plugin"'
				);
				expect(err.stack).toContain(
					'Transformer "mock-plugin" refers to unnamed transformer but plugin exposes only named.'
				);
				/* eslint-enable jest/no-try-expect */
			}
		});

		it("should throw error when referencing unnamed transformer with name", () => {
			expect.assertions(3);
			mockPlugin.transformer = function transform(): Source[] {
				return [];
			};
			config = Config.fromObject({
				plugins: ["mock-plugin"],
				transform: {
					".*": "mock-plugin:foobar",
				},
			});
			try {
				config.init();
			} catch (err) {
				/* need to test NestedError to ensure the error messsage is sane */
				/* eslint-disable jest/no-try-expect */
				expect(err).toBeInstanceOf(NestedError);
				expect(err.message).toContain(
					'Failed to load transformer "mock-plugin:foobar"'
				);
				expect(err.stack).toContain(
					'Transformer "mock-plugin:foobar" refers to named transformer but plugin exposes only unnamed, use "mock-plugin" instead.'
				);
				/* eslint-enable jest/no-try-expect */
			}
		});
	});
});
