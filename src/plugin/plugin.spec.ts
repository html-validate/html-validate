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
});
