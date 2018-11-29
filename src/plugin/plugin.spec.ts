import { Config } from "../config";
import { Source } from "../context";
import { Engine } from "../engine";
import { EventHandler } from "../event";
import { Parser } from "../parser";
import { Rule } from "../rule";
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
			expect(() => new Engine(config, Parser)).not.toThrow();
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
			const mockRule: Rule = new class extends Rule {
				public setup() {
					/* do nothing */
				}
			}({});
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
});
