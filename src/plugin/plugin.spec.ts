import { Config } from "../config";
import { Plugin } from "./plugin";

let mockPlugin: Plugin;
let config: Config;

jest.mock("mock-plugin", () => ({}), { virtual: true });

describe("Plugin", () => {
	/* reset mock */
	beforeEach(() => {
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
});
