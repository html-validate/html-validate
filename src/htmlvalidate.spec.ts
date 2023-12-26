import { StaticConfigLoader } from "./browser";
import { Config, ConfigData, ConfigLoader, ResolvedConfig, Severity } from "./config";
import { cjsResolver } from "./config/resolver/nodejs";
import { Source, SourceHooks } from "./context";
import { HtmlValidate } from "./htmlvalidate";
import { Parser } from "./parser";
import { Message } from "./reporter";

const engine = {
	lint: jest.fn(),
	dumpEvents: jest.fn(),
	dumpTree: jest.fn(),
	dumpTokens: jest.fn(),
	getRuleDocumentation: jest.fn(),
};

const resolver = cjsResolver();

jest.mock("./engine", () => {
	return {
		Engine: jest.fn().mockImplementation(() => engine),
	};
});
jest.mock("./parser");

function mockConfig(): Promise<ResolvedConfig> {
	const config = Config.empty();
	const original = config.resolve;
	config.init();
	jest.spyOn(config, "resolve").mockImplementation(() => {
		const resolved = original.call(config);
		resolved.transformFilename = jest.fn((filename: string): Source[] => [
			{
				data: `source from ${filename}`,
				filename,
				line: 1,
				column: 1,
				offset: 0,
			},
		]);
		return resolved;
	});
	return Promise.resolve(config.resolve());
}

function mockConfigSync(): ResolvedConfig {
	const config = Config.empty();
	const original = config.resolve;
	config.init();
	jest.spyOn(config, "resolve").mockImplementation(() => {
		const resolved = original.call(config);
		resolved.transformFilename = jest.fn((filename: string): Source[] => [
			{
				data: `source from ${filename}`,
				filename,
				line: 1,
				column: 1,
				offset: 0,
			},
		]);
		return resolved;
	});
	return config.resolve();
}

beforeEach(() => {
	jest.clearAllMocks();
});

describe("HtmlValidate", () => {
	it("should support using a custom config loader", async () => {
		expect.assertions(2);
		const loader = new (class extends ConfigLoader {
			public getConfigFor(): ResolvedConfig {
				return Config.fromObject([], {
					rules: {
						foobar: "error",
					},
				}).resolve();
			}
			public flushCache(): void {
				/* do nothing */
			}
			protected defaultConfig(): Config {
				return Config.defaultConfig();
			}
		})([]);
		const getConfigFor = jest.spyOn(loader, "getConfigFor");
		const htmlvalidate = new HtmlValidate(loader);
		const filename = "/path/to/my-file.html";
		const config = await htmlvalidate.getConfigFor(filename);
		expect(getConfigFor).toHaveBeenCalledWith(filename, undefined);
		expect(config.getConfigData()).toEqual({
			extends: [],
			plugins: [],
			rules: {
				foobar: "error",
			},
			transform: {},
		});
	});

	describe("validateString()", () => {
		it("should validate given string", async () => {
			expect.assertions(2);
			const mockReport = "mock-report";
			engine.lint.mockReturnValue(mockReport);
			const htmlvalidate = new HtmlValidate();
			const str = "foobar";
			const report = await htmlvalidate.validateString(str);
			expect(report).toEqual(mockReport);
			expect(engine.lint).toHaveBeenCalledWith([
				{
					column: 1,
					data: str,
					filename: "inline",
					line: 1,
					offset: 0,
				},
			]);
		});

		it("should reject promise if an error occurs", async () => {
			expect.assertions(1);
			engine.lint.mockImplementationOnce(() => {
				throw new Error("Mock error");
			});
			const htmlvalidate = new HtmlValidate();
			await expect(htmlvalidate.validateString("")).rejects.toThrow("Mock error");
		});

		it("should load configuration if filename is given", async () => {
			expect.assertions(1);
			const mockReport = "mock-report";
			engine.lint.mockReturnValue(mockReport);
			const htmlvalidate = new HtmlValidate();
			const spy = jest.spyOn(htmlvalidate, "getConfigFor");
			const str = "foobar";
			await htmlvalidate.validateString(str, "my-file.html");
			expect(spy).toHaveBeenCalledWith("my-file.html", undefined);
		});

		it("should allow overriding configuration", async () => {
			expect.assertions(1);
			const mockReport = "mock-report";
			engine.lint.mockReturnValue(mockReport);
			const htmlvalidate = new HtmlValidate();
			const spy = jest.spyOn(htmlvalidate, "getConfigFor");
			const str = "foobar";
			await htmlvalidate.validateString(str, "my-file.html", {
				rules: {
					deprecated: "off",
				},
			});
			expect(spy).toHaveBeenCalledWith("my-file.html", {
				rules: {
					deprecated: "off",
				},
			});
		});

		describe("prototype", () => {
			const report = "mock-report";
			const markup = "<i></i>";
			let htmlvalidate: HtmlValidate;

			beforeEach(() => {
				htmlvalidate = new HtmlValidate();
				engine.lint.mockReturnValue(report);
			});

			it("str", async () => {
				expect.assertions(1);
				await htmlvalidate.validateString(markup);
				expect(engine.lint).toHaveBeenCalledWith([
					{
						line: 1,
						column: 1,
						offset: 0,
						data: markup,
						filename: "inline",
					},
				]);
			});

			it("str, filename", async () => {
				expect.assertions(1);
				await htmlvalidate.validateString(markup, "my-file.html");
				expect(engine.lint).toHaveBeenCalledWith([
					{
						line: 1,
						column: 1,
						offset: 0,
						data: markup,
						filename: "my-file.html",
					},
				]);
			});

			it("str, hooks", async () => {
				expect.assertions(1);
				const hooks: SourceHooks = {
					processElement: () => {
						return null;
					},
				};
				await htmlvalidate.validateString(markup, hooks);
				expect(engine.lint).toHaveBeenCalledWith([
					{
						line: 1,
						column: 1,
						offset: 0,
						data: markup,
						filename: "inline",
						hooks,
					},
				]);
			});

			it("str, options", async () => {
				expect.assertions(1);
				const options: ConfigData = {};
				await htmlvalidate.validateString(markup, options);
				expect(engine.lint).toHaveBeenCalledWith([
					{
						line: 1,
						column: 1,
						offset: 0,
						data: markup,
						filename: "inline",
					},
				]);
			});

			it("str, filename, hooks", async () => {
				expect.assertions(1);
				const hooks: SourceHooks = {
					processAttribute: () => {
						return [];
					},
				};
				await htmlvalidate.validateString(markup, "my-file.html", hooks);
				expect(engine.lint).toHaveBeenCalledWith([
					{
						line: 1,
						column: 1,
						offset: 0,
						data: markup,
						filename: "my-file.html",
						hooks,
					},
				]);
			});

			it("str, filename, options", async () => {
				expect.assertions(1);
				const options: ConfigData = {};
				await htmlvalidate.validateString(markup, "my-file.html", options);
				expect(engine.lint).toHaveBeenCalledWith([
					{
						line: 1,
						column: 1,
						offset: 0,
						data: markup,
						filename: "my-file.html",
					},
				]);
			});

			it("str, filename, options, hooks", async () => {
				expect.assertions(1);
				const options: ConfigData = {};
				const hooks: SourceHooks = {
					processAttribute: () => {
						return [];
					},
				};
				await htmlvalidate.validateString(markup, "my-file.html", options, hooks);
				expect(engine.lint).toHaveBeenCalledWith([
					{
						line: 1,
						column: 1,
						offset: 0,
						data: markup,
						filename: "my-file.html",
						hooks,
					},
				]);
			});
		});
	});

	describe("validateStringSync()", () => {
		it("should validate given string", () => {
			expect.assertions(2);
			const mockReport = "mock-report";
			engine.lint.mockReturnValue(mockReport);
			const htmlvalidate = new HtmlValidate();
			const str = "foobar";
			const report = htmlvalidate.validateStringSync(str);
			expect(report).toEqual(mockReport);
			expect(engine.lint).toHaveBeenCalledWith([
				{
					column: 1,
					data: str,
					filename: "inline",
					line: 1,
					offset: 0,
				},
			]);
		});

		it("should load configuration if filename is given", () => {
			expect.assertions(1);
			const mockReport = "mock-report";
			engine.lint.mockReturnValue(mockReport);
			const htmlvalidate = new HtmlValidate();
			const spy = jest.spyOn(htmlvalidate, "getConfigForSync");
			const str = "foobar";
			htmlvalidate.validateStringSync(str, "my-file.html");
			expect(spy).toHaveBeenCalledWith("my-file.html", undefined);
		});

		it("should allow overriding configuration", () => {
			expect.assertions(1);
			const mockReport = "mock-report";
			engine.lint.mockReturnValue(mockReport);
			const htmlvalidate = new HtmlValidate();
			const spy = jest.spyOn(htmlvalidate, "getConfigForSync");
			const str = "foobar";
			htmlvalidate.validateStringSync(str, "my-file.html", {
				rules: {
					deprecated: "off",
				},
			});
			expect(spy).toHaveBeenCalledWith("my-file.html", {
				rules: {
					deprecated: "off",
				},
			});
		});

		describe("prototype", () => {
			const report = "mock-report";
			const markup = "<i></i>";
			let htmlvalidate: HtmlValidate;

			beforeEach(() => {
				htmlvalidate = new HtmlValidate();
				engine.lint.mockReturnValue(report);
			});

			it("str", () => {
				expect.assertions(1);
				htmlvalidate.validateStringSync(markup);
				expect(engine.lint).toHaveBeenCalledWith([
					{
						line: 1,
						column: 1,
						offset: 0,
						data: markup,
						filename: "inline",
					},
				]);
			});

			it("str, filename", () => {
				expect.assertions(1);
				htmlvalidate.validateStringSync(markup, "my-file.html");
				expect(engine.lint).toHaveBeenCalledWith([
					{
						line: 1,
						column: 1,
						offset: 0,
						data: markup,
						filename: "my-file.html",
					},
				]);
			});

			it("str, hooks", () => {
				expect.assertions(1);
				const hooks: SourceHooks = {
					processElement: () => {
						return null;
					},
				};
				htmlvalidate.validateStringSync(markup, hooks);
				expect(engine.lint).toHaveBeenCalledWith([
					{
						line: 1,
						column: 1,
						offset: 0,
						data: markup,
						filename: "inline",
						hooks,
					},
				]);
			});

			it("str, options", () => {
				expect.assertions(1);
				const options: ConfigData = {};
				htmlvalidate.validateStringSync(markup, options);
				expect(engine.lint).toHaveBeenCalledWith([
					{
						line: 1,
						column: 1,
						offset: 0,
						data: markup,
						filename: "inline",
					},
				]);
			});

			it("str, filename, hooks", () => {
				expect.assertions(1);
				const hooks: SourceHooks = {
					processAttribute: () => {
						return [];
					},
				};
				htmlvalidate.validateStringSync(markup, "my-file.html", hooks);
				expect(engine.lint).toHaveBeenCalledWith([
					{
						line: 1,
						column: 1,
						offset: 0,
						data: markup,
						filename: "my-file.html",
						hooks,
					},
				]);
			});

			it("str, filename, options", () => {
				expect.assertions(1);
				const options: ConfigData = {};
				htmlvalidate.validateStringSync(markup, "my-file.html", options);
				expect(engine.lint).toHaveBeenCalledWith([
					{
						line: 1,
						column: 1,
						offset: 0,
						data: markup,
						filename: "my-file.html",
					},
				]);
			});

			it("str, filename, options, hooks", () => {
				expect.assertions(1);
				const options: ConfigData = {};
				const hooks: SourceHooks = {
					processAttribute: () => {
						return [];
					},
				};
				htmlvalidate.validateStringSync(markup, "my-file.html", options, hooks);
				expect(engine.lint).toHaveBeenCalledWith([
					{
						line: 1,
						column: 1,
						offset: 0,
						data: markup,
						filename: "my-file.html",
						hooks,
					},
				]);
			});
		});
	});

	it("validateSource() should lint given source", async () => {
		expect.assertions(2);
		const mockReport = "mock-report";
		engine.lint.mockResolvedValue(mockReport);
		const htmlvalidate = new HtmlValidate();
		const source: Source = {
			data: "foo",
			filename: "inline",
			line: 1,
			column: 1,
			offset: 0,
		};
		const report = await htmlvalidate.validateSource(source);
		expect(report).toEqual(mockReport);
		expect(engine.lint).toHaveBeenCalledWith([source]);
	});

	it("validateSourceSync() should lint given source", () => {
		expect.assertions(2);
		const mockReport = "mock-report";
		engine.lint.mockReturnValue(mockReport);
		const htmlvalidate = new HtmlValidate();
		const source: Source = {
			data: "foo",
			filename: "inline",
			line: 1,
			column: 1,
			offset: 0,
		};
		const report = htmlvalidate.validateSourceSync(source);
		expect(report).toEqual(mockReport);
		expect(engine.lint).toHaveBeenCalledWith([source]);
	});

	it("validateFile() should lint given file", async () => {
		expect.assertions(2);
		const mockReport = "mock-report";
		engine.lint.mockReturnValue(mockReport);
		const htmlvalidate = new HtmlValidate();
		const filename = "foo.html";
		jest.spyOn(htmlvalidate, "getConfigFor").mockImplementation(mockConfig);
		const report = await htmlvalidate.validateFile(filename);
		expect(report).toEqual(mockReport);
		expect(engine.lint).toHaveBeenCalledWith([
			{
				column: 1,
				data: "source from foo.html",
				filename,
				line: 1,
				offset: 0,
			},
		]);
	});

	it("validateFileSync() should lint given file", () => {
		expect.assertions(2);
		const mockReport = "mock-report";
		engine.lint.mockReturnValue(mockReport);
		const htmlvalidate = new HtmlValidate();
		const filename = "foo.html";
		jest.spyOn(htmlvalidate, "getConfigForSync").mockImplementation(mockConfigSync);
		const report = htmlvalidate.validateFileSync(filename);
		expect(report).toEqual(mockReport);
		expect(engine.lint).toHaveBeenCalledWith([
			{
				column: 1,
				data: "source from foo.html",
				filename,
				line: 1,
				offset: 0,
			},
		]);
	});

	describe("validateMultipleFiles()", () => {
		const warning: Message = {
			ruleId: "mock-warning",
			message: "mock warning message",
			severity: Severity.WARN,
			line: 1,
			column: 1,
			offset: 0,
			size: 1,
			selector: null,
		};
		const error: Message = {
			ruleId: "mock-error",
			message: "mock error message",
			severity: Severity.ERROR,
			line: 1,
			column: 1,
			offset: 0,
			size: 1,
			selector: null,
		};

		it("should call validateFile for each file", async () => {
			expect.assertions(3);
			const htmlvalidate = new HtmlValidate();
			const spy = jest.spyOn(htmlvalidate, "validateFileSync").mockReturnValue({
				valid: true,
				results: [],
				errorCount: 0,
				warningCount: 0,
			});
			await htmlvalidate.validateMultipleFiles(["foo.html", "bar.html"]);
			expect(spy).toHaveBeenCalledTimes(2);
			expect(spy).toHaveBeenCalledWith("foo.html");
			expect(spy).toHaveBeenCalledWith("bar.html");
		});

		it("should merge reports", async () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate();
			jest
				.spyOn(htmlvalidate, "validateFileSync")
				.mockReturnValueOnce({
					valid: true,
					results: [
						{
							filePath: "foo.html",
							messages: [warning],
							errorCount: 0,
							warningCount: 1,
							source: null,
						},
					],
					errorCount: 0,
					warningCount: 1,
				})
				.mockReturnValueOnce({
					valid: false,
					results: [
						{
							filePath: "bar.html",
							messages: [error],
							errorCount: 1,
							warningCount: 0,
							source: null,
						},
					],
					errorCount: 1,
					warningCount: 0,
				});
			const report = await htmlvalidate.validateMultipleFiles(["foo.html", "bar.html"]);
			expect(report).toMatchInlineSnapshot(`
			{
			  "errorCount": 1,
			  "results": [
			    {
			      "errorCount": 0,
			      "filePath": "foo.html",
			      "messages": [
			        {
			          "column": 1,
			          "line": 1,
			          "message": "mock warning message",
			          "offset": 0,
			          "ruleId": "mock-warning",
			          "selector": null,
			          "severity": 1,
			          "size": 1,
			        },
			      ],
			      "source": null,
			      "warningCount": 1,
			    },
			    {
			      "errorCount": 1,
			      "filePath": "bar.html",
			      "messages": [
			        {
			          "column": 1,
			          "line": 1,
			          "message": "mock error message",
			          "offset": 0,
			          "ruleId": "mock-error",
			          "selector": null,
			          "severity": 2,
			          "size": 1,
			        },
			      ],
			      "source": null,
			      "warningCount": 0,
			    },
			  ],
			  "valid": false,
			  "warningCount": 1,
			}
		`);
		});
	});

	describe("validateMultipleFilesSync()", () => {
		const warning: Message = {
			ruleId: "mock-warning",
			message: "mock warning message",
			severity: Severity.WARN,
			line: 1,
			column: 1,
			offset: 0,
			size: 1,
			selector: null,
		};
		const error: Message = {
			ruleId: "mock-error",
			message: "mock error message",
			severity: Severity.ERROR,
			line: 1,
			column: 1,
			offset: 0,
			size: 1,
			selector: null,
		};

		it("should call validateFileSync for each file", () => {
			expect.assertions(3);
			const htmlvalidate = new HtmlValidate();
			const spy = jest.spyOn(htmlvalidate, "validateFileSync").mockReturnValue({
				valid: true,
				results: [],
				errorCount: 0,
				warningCount: 0,
			});
			htmlvalidate.validateMultipleFilesSync(["foo.html", "bar.html"]);
			expect(spy).toHaveBeenCalledTimes(2);
			expect(spy).toHaveBeenCalledWith("foo.html");
			expect(spy).toHaveBeenCalledWith("bar.html");
		});

		it("should merge reports", () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate();
			jest
				.spyOn(htmlvalidate, "validateFileSync")
				.mockReturnValueOnce({
					valid: true,
					results: [
						{
							filePath: "foo.html",
							messages: [warning],
							errorCount: 0,
							warningCount: 1,
							source: null,
						},
					],
					errorCount: 0,
					warningCount: 1,
				})
				.mockReturnValueOnce({
					valid: false,
					results: [
						{
							filePath: "bar.html",
							messages: [error],
							errorCount: 1,
							warningCount: 0,
							source: null,
						},
					],
					errorCount: 1,
					warningCount: 0,
				});
			const report = htmlvalidate.validateMultipleFilesSync(["foo.html", "bar.html"]);
			expect(report).toMatchInlineSnapshot(`
			{
			  "errorCount": 1,
			  "results": [
			    {
			      "errorCount": 0,
			      "filePath": "foo.html",
			      "messages": [
			        {
			          "column": 1,
			          "line": 1,
			          "message": "mock warning message",
			          "offset": 0,
			          "ruleId": "mock-warning",
			          "selector": null,
			          "severity": 1,
			          "size": 1,
			        },
			      ],
			      "source": null,
			      "warningCount": 1,
			    },
			    {
			      "errorCount": 1,
			      "filePath": "bar.html",
			      "messages": [
			        {
			          "column": 1,
			          "line": 1,
			          "message": "mock error message",
			          "offset": 0,
			          "ruleId": "mock-error",
			          "selector": null,
			          "severity": 2,
			          "size": 1,
			        },
			      ],
			      "source": null,
			      "warningCount": 0,
			    },
			  ],
			  "valid": false,
			  "warningCount": 1,
			}
		`);
		});
	});

	describe("canValidate()", () => {
		let htmlvalidate: HtmlValidate;

		beforeAll(() => {
			const loader = new StaticConfigLoader([resolver], {
				root: true,
				transform: {
					"^.*\\.foo$": "mock-transform",
				},
			});
			htmlvalidate = new HtmlValidate(loader);
		});

		it("should return true if file extension is .html", async () => {
			expect.assertions(2);
			expect(await htmlvalidate.canValidate("my-file.html")).toBeTruthy();
			expect(await htmlvalidate.canValidate("MY-FILE.HTML")).toBeTruthy();
		});

		it("should return true if a transformer can handle the file", async () => {
			expect.assertions(1);
			expect(await htmlvalidate.canValidate("my-file.foo")).toBeTruthy();
		});

		it("should return false if no transformer can handle the file", async () => {
			expect.assertions(1);
			expect(await htmlvalidate.canValidate("my-file.bar")).toBeFalsy();
		});
	});

	describe("canValidateSync()", () => {
		let htmlvalidate: HtmlValidate;

		beforeAll(() => {
			const loader = new StaticConfigLoader([resolver], {
				root: true,
				transform: {
					"^.*\\.foo$": "mock-transform",
				},
			});
			htmlvalidate = new HtmlValidate(loader);
		});

		it("should return true if file extension is .html", () => {
			expect.assertions(2);
			expect(htmlvalidate.canValidateSync("my-file.html")).toBeTruthy();
			expect(htmlvalidate.canValidateSync("MY-FILE.HTML")).toBeTruthy();
		});

		it("should return true if a transformer can handle the file", () => {
			expect.assertions(1);
			expect(htmlvalidate.canValidateSync("my-file.foo")).toBeTruthy();
		});

		it("should return false if no transformer can handle the file", () => {
			expect.assertions(1);
			expect(htmlvalidate.canValidateSync("my-file.bar")).toBeFalsy();
		});
	});

	it("dumpTokens() should dump tokens", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate();
		const filename = "foo.html";
		jest.spyOn(htmlvalidate, "getConfigForSync").mockImplementation(mockConfigSync);
		htmlvalidate.dumpTokens(filename);
		expect(engine.dumpTokens).toHaveBeenCalledWith([
			{
				column: 1,
				data: "source from foo.html",
				filename,
				line: 1,
				offset: 0,
			},
		]);
	});

	it("dumpEvents() should dump events", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate();
		const filename = "foo.html";
		jest.spyOn(htmlvalidate, "getConfigForSync").mockImplementation(mockConfigSync);
		htmlvalidate.dumpEvents(filename);
		expect(engine.dumpEvents).toHaveBeenCalledWith([
			{
				column: 1,
				data: "source from foo.html",
				filename,
				line: 1,
				offset: 0,
			},
		]);
	});

	it("dumpTree() should dump tree", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate();
		const filename = "foo.html";
		jest.spyOn(htmlvalidate, "getConfigForSync").mockImplementation(mockConfigSync);
		htmlvalidate.dumpTree(filename);
		expect(engine.dumpTree).toHaveBeenCalledWith([
			{
				column: 1,
				data: "source from foo.html",
				filename,
				line: 1,
				offset: 0,
			},
		]);
	});

	it("dumpSources() should dump sources", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate();
		const filename = "foo.html";
		const config = Config.empty();
		const original = config.resolve;
		config.init();
		config.resolve = () => {
			const resolved = original.call(config);
			resolved.transformFilename = jest.fn((filename: string): Source[] => [
				{
					data: `first markup`,
					filename,
					line: 1,
					column: 1,
					offset: 0,
					transformedBy: ["bar", "foo"],
				},
				{
					data: `second markup`,
					filename,
					line: 5,
					column: 3,
					offset: 29,
					hooks: {
						processElement: () => null,
						processAttribute: null,
					},
				},
				{
					data: `third markup`,
					filename,
					line: 12,
					column: 1,
					offset: 69,
					hooks: {},
				},
			]);
			return resolved;
		};
		jest.spyOn(htmlvalidate, "getConfigForSync").mockImplementation(() => config.resolve());
		const output = htmlvalidate.dumpSource(filename);
		expect(output).toMatchInlineSnapshot(`
			[
			  "Source foo.html@1:1 (offset: 0)",
			  "Transformed by:",
			  " - foo",
			  " - bar",
			  "---",
			  "first markup",
			  "---",
			  "Source foo.html@5:3 (offset: 29)",
			  "Hooks",
			  " - processElement",
			  "---",
			  "second markup",
			  "---",
			  "Source foo.html@12:1 (offset: 69)",
			  "---",
			  "third markup",
			  "---",
			]
		`);
	});

	it("getConfiurationSchema() should get effective configuration schema", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate();
		const schema = htmlvalidate.getConfigurationSchema();
		expect(schema).toBeDefined();
	});

	it("getElementsSchema() should get effective elements schema", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate();
		const schema = await htmlvalidate.getElementsSchema("./path/to/elements.json");
		expect(schema).toBeDefined();
	});

	it("getElementsSchemaSync() should get effective elements schema", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate();
		const schema = htmlvalidate.getElementsSchemaSync("./path/to/elements.json");
		expect(schema).toBeDefined();
	});

	it("getElementsSchema() should not require filename", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate();
		const schema = await htmlvalidate.getElementsSchema();
		expect(schema).toBeDefined();
	});

	it("getElementsSchemaSync() should not require filename", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate();
		const schema = htmlvalidate.getElementsSchemaSync();
		expect(schema).toBeDefined();
	});

	describe("getContextualDocumentation()", () => {
		it("should get contextual documentation", async () => {
			expect.assertions(2);
			const htmlvalidate = new HtmlValidate();
			await htmlvalidate.getContextualDocumentation({ ruleId: "foo" });
			await htmlvalidate.getContextualDocumentation({ ruleId: "foo", context: { bar: "baz" } });
			expect(engine.getRuleDocumentation).toHaveBeenCalledWith({ ruleId: "foo" });
			expect(engine.getRuleDocumentation).toHaveBeenCalledWith({
				ruleId: "foo",
				context: {
					bar: "baz",
				},
			});
		});

		it("should use inline config by default", async () => {
			expect.assertions(2);
			const htmlvalidate = new HtmlValidate();
			const getConfigFor = jest.spyOn(htmlvalidate, "getConfigFor");
			await htmlvalidate.getContextualDocumentation({ ruleId: "foo" });
			expect(getConfigFor).toHaveBeenCalledTimes(1);
			expect(getConfigFor).toHaveBeenCalledWith("inline");
		});

		it("should get config for given filename", async () => {
			expect.assertions(2);
			const htmlvalidate = new HtmlValidate();
			const getConfigFor = jest.spyOn(htmlvalidate, "getConfigFor");
			await htmlvalidate.getContextualDocumentation({ ruleId: "foo" }, "my-file.html");
			expect(getConfigFor).toHaveBeenCalledTimes(1);
			expect(getConfigFor).toHaveBeenCalledWith("my-file.html");
		});

		it("should use given configuration", async () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate();
			const config = Config.empty().resolve();
			const getConfigFor = jest.spyOn(htmlvalidate, "getConfigFor");
			await htmlvalidate.getContextualDocumentation({ ruleId: "foo" }, config);
			expect(getConfigFor).not.toHaveBeenCalled();
		});
	});

	describe("getContextualDocumentationSync()", () => {
		it("should get contextual documentation", () => {
			expect.assertions(2);
			const htmlvalidate = new HtmlValidate();
			htmlvalidate.getContextualDocumentationSync({ ruleId: "foo" });
			htmlvalidate.getContextualDocumentationSync({ ruleId: "foo", context: { bar: "baz" } });
			expect(engine.getRuleDocumentation).toHaveBeenCalledWith({ ruleId: "foo" });
			expect(engine.getRuleDocumentation).toHaveBeenCalledWith({
				ruleId: "foo",
				context: {
					bar: "baz",
				},
			});
		});

		it("should use inline config by default", () => {
			expect.assertions(2);
			const htmlvalidate = new HtmlValidate();
			const getConfigFor = jest.spyOn(htmlvalidate, "getConfigForSync");
			htmlvalidate.getContextualDocumentationSync({ ruleId: "foo" });
			expect(getConfigFor).toHaveBeenCalledTimes(1);
			expect(getConfigFor).toHaveBeenCalledWith("inline");
		});

		it("should get config for given filename", () => {
			expect.assertions(2);
			const htmlvalidate = new HtmlValidate();
			const getConfigFor = jest.spyOn(htmlvalidate, "getConfigForSync");
			htmlvalidate.getContextualDocumentationSync({ ruleId: "foo" }, "my-file.html");
			expect(getConfigFor).toHaveBeenCalledTimes(1);
			expect(getConfigFor).toHaveBeenCalledWith("my-file.html");
		});

		it("should use given configuration", () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate();
			const config = Config.empty().resolve();
			const getConfigFor = jest.spyOn(htmlvalidate, "getConfigForSync");
			htmlvalidate.getContextualDocumentationSync({ ruleId: "foo" }, config);
			expect(getConfigFor).not.toHaveBeenCalled();
		});
	});

	it("getRuleDocumentation() should delegate call to engine", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate();
		const config = Config.empty().resolve();
		await htmlvalidate.getRuleDocumentation("foo");
		await htmlvalidate.getRuleDocumentation("foo", config, { bar: "baz" });
		expect(engine.getRuleDocumentation).toHaveBeenCalledWith({ ruleId: "foo", context: null });
		expect(engine.getRuleDocumentation).toHaveBeenCalledWith({
			ruleId: "foo",
			context: {
				bar: "baz",
			},
		});
	});

	it("getRuleDocumentationSync() should delegate call to engine", () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate();
		const config = Config.empty().resolve();
		htmlvalidate.getRuleDocumentationSync("foo");
		htmlvalidate.getRuleDocumentationSync("foo", config, { bar: "baz" });
		expect(engine.getRuleDocumentation).toHaveBeenCalledWith({ ruleId: "foo", context: null });
		expect(engine.getRuleDocumentation).toHaveBeenCalledWith({
			ruleId: "foo",
			context: {
				bar: "baz",
			},
		});
	});

	it("getParserFor() should create a parser for given filename", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate();
		const config = Config.empty().resolve();
		jest.spyOn(htmlvalidate, "getConfigFor").mockResolvedValue(config);
		const source: Source = {
			data: "foo",
			filename: "inline",
			line: 1,
			column: 1,
			offset: 0,
		};
		const parser = await htmlvalidate.getParserFor(source);
		expect(parser).toBeInstanceOf(Parser);
		expect(Parser).toHaveBeenCalledWith(config);
	});

	it("flushConfigCache() should delegate to configLoader", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate();
		const flushCache = jest.spyOn((htmlvalidate as any).configLoader as ConfigLoader, "flushCache");
		htmlvalidate.flushConfigCache("foo");
		expect(flushCache).toHaveBeenCalledWith("foo");
	});
});
