import { Config, ConfigLoader, Severity } from "./config";
import { Source } from "./context";
import HtmlValidate from "./htmlvalidate";
import { Parser } from "./parser";
import { Message } from "./reporter";

const engine = {
	lint: jest.fn(),
	dumpEvents: jest.fn(),
	dumpTree: jest.fn(),
	dumpTokens: jest.fn(),
	getRuleDocumentation: jest.fn(),
};

jest.mock("./engine", () => {
	return {
		Engine: jest.fn().mockImplementation(() => engine),
	};
});
jest.mock("./parser");

function mockConfig(): Config {
	const config = Config.empty();
	config.init();
	config.transform = jest.fn((filename: string) => [
		{
			column: 1,
			data: `source from ${filename}`,
			filename,
			line: 1,
		},
	]);
	return config;
}

beforeEach(() => {
	jest.clearAllMocks();
});

describe("HtmlValidate", () => {
	it("should load default config if no configuration was passed", () => {
		const htmlvalidate = new HtmlValidate();
		expect((htmlvalidate as any).globalConfig.config).toEqual(
			expect.objectContaining({
				extends: ["htmlvalidate:recommended"],
			})
		);
	});

	it("should not load default config if configuration was passed", () => {
		const htmlvalidate = new HtmlValidate({});
		expect((htmlvalidate as any).globalConfig.config).toEqual(
			expect.objectContaining({
				extends: [],
			})
		);
	});

	describe("validateString()", () => {
		it("should validate given string", () => {
			const mockReport = "mock-report";
			engine.lint.mockReturnValue(mockReport);
			const htmlvalidate = new HtmlValidate();
			const str = "foobar";
			const report = htmlvalidate.validateString(str);
			expect(report).toEqual(mockReport);
			expect(engine.lint).toHaveBeenCalledWith([
				{
					column: 1,
					data: str,
					filename: "inline",
					line: 1,
				},
			]);
		});

		it("should load configuration if filename is given", () => {
			const mockReport = "mock-report";
			engine.lint.mockReturnValue(mockReport);
			const htmlvalidate = new HtmlValidate();
			const spy = jest.spyOn(htmlvalidate, "getConfigFor");
			const str = "foobar";
			htmlvalidate.validateString(str, "my-file.html");
			expect(spy).toHaveBeenCalledWith("my-file.html");
		});
	});

	it("validateSource() should lint given source", () => {
		const mockReport = "mock-report";
		engine.lint.mockReturnValue(mockReport);
		const htmlvalidate = new HtmlValidate();
		const source: Source = {
			data: "foo",
			filename: "inline",
			line: 1,
			column: 1,
		};
		const report = htmlvalidate.validateSource(source);
		expect(report).toEqual(mockReport);
		expect(engine.lint).toHaveBeenCalledWith([source]);
	});

	it("validateFile() should lint given file", () => {
		const mockReport = "mock-report";
		engine.lint.mockReturnValue(mockReport);
		const htmlvalidate = new HtmlValidate();
		const filename = "foo.html";
		jest.spyOn(htmlvalidate, "getConfigFor").mockImplementation(mockConfig);
		const report = htmlvalidate.validateFile(filename);
		expect(report).toEqual(mockReport);
		expect(engine.lint).toHaveBeenCalledWith([
			{
				column: 1,
				data: "source from foo.html",
				filename,
				line: 1,
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
		};
		const error: Message = {
			ruleId: "mock-error",
			message: "mock error message",
			severity: Severity.ERROR,
			line: 1,
			column: 1,
			offset: 0,
			size: 1,
		};

		it("should call validateFile for each file", () => {
			expect.assertions(3);
			const htmlvalidate = new HtmlValidate();
			const spy = jest.spyOn(htmlvalidate, "validateFile").mockReturnValue({
				valid: true,
				results: [],
				errorCount: 0,
				warningCount: 0,
			});
			htmlvalidate.validateMultipleFiles(["foo.html", "bar.html"]);
			expect(spy).toHaveBeenCalledTimes(2);
			expect(spy).toHaveBeenCalledWith("foo.html");
			expect(spy).toHaveBeenCalledWith("bar.html");
		});

		it("should merge reports", () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate();
			jest
				.spyOn(htmlvalidate, "validateFile")
				.mockReturnValueOnce({
					valid: true,
					results: [
						{
							filePath: "foo.html",
							messages: [warning],
							errorCount: 0,
							warningCount: 1,
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
						},
					],
					errorCount: 1,
					warningCount: 0,
				});
			const report = htmlvalidate.validateMultipleFiles([
				"foo.html",
				"bar.html",
			]);
			expect(report).toMatchInlineSnapshot(`
			Object {
			  "errorCount": 1,
			  "results": Array [
			    Object {
			      "errorCount": 0,
			      "filePath": "foo.html",
			      "messages": Array [
			        Object {
			          "column": 1,
			          "line": 1,
			          "message": "mock warning message",
			          "offset": 0,
			          "ruleId": "mock-warning",
			          "severity": 1,
			          "size": 1,
			        },
			      ],
			      "warningCount": 1,
			    },
			    Object {
			      "errorCount": 1,
			      "filePath": "bar.html",
			      "messages": Array [
			        Object {
			          "column": 1,
			          "line": 1,
			          "message": "mock error message",
			          "offset": 0,
			          "ruleId": "mock-error",
			          "severity": 2,
			          "size": 1,
			        },
			      ],
			      "warningCount": 0,
			    },
			  ],
			  "valid": false,
			  "warningCount": 1,
			}
		`);
		});
	});

	it("dumpTokens() should dump tokens", () => {
		const htmlvalidate = new HtmlValidate();
		const filename = "foo.html";
		jest.spyOn(htmlvalidate, "getConfigFor").mockImplementation(mockConfig);
		htmlvalidate.dumpTokens(filename);
		expect(engine.dumpTokens).toHaveBeenCalledWith([
			{
				column: 1,
				data: "source from foo.html",
				filename,
				line: 1,
			},
		]);
	});

	it("dumpEvents() should dump events", () => {
		const htmlvalidate = new HtmlValidate();
		const filename = "foo.html";
		jest.spyOn(htmlvalidate, "getConfigFor").mockImplementation(mockConfig);
		htmlvalidate.dumpEvents(filename);
		expect(engine.dumpEvents).toHaveBeenCalledWith([
			{
				column: 1,
				data: "source from foo.html",
				filename,
				line: 1,
			},
		]);
	});

	it("dumpTree() should dump tree", () => {
		const htmlvalidate = new HtmlValidate();
		const filename = "foo.html";
		jest.spyOn(htmlvalidate, "getConfigFor").mockImplementation(mockConfig);
		htmlvalidate.dumpTree(filename);
		expect(engine.dumpTree).toHaveBeenCalledWith([
			{
				column: 1,
				data: "source from foo.html",
				filename,
				line: 1,
			},
		]);
	});

	it("getRuleDocumentation() should delegate call to engine", () => {
		const htmlvalidate = new HtmlValidate();
		const config = Config.empty();
		htmlvalidate.getRuleDocumentation("foo", config, { bar: "baz" });
		expect(engine.getRuleDocumentation).toHaveBeenCalledWith("foo", {
			bar: "baz",
		});
	});

	describe("getConfigFor()", () => {
		it("should load configuration files and merge result", () => {
			const htmlvalidate = new HtmlValidate({
				rules: {
					fred: "error",
				},
			});
			const fromTarget = jest
				.spyOn((htmlvalidate as any).configLoader, "fromTarget")
				.mockImplementation(() =>
					Config.fromObject({
						rules: {
							barney: "error",
						},
					})
				);
			const config = htmlvalidate.getConfigFor("my-file.html");
			expect(fromTarget).toHaveBeenCalledWith("my-file.html");
			expect(config.get()).toEqual(
				expect.objectContaining({
					rules: {
						fred: "error",
						barney: "error",
					},
				})
			);
		});

		it("should not load configuration files if global config is root", () => {
			const htmlvalidate = new HtmlValidate({
				root: true,
			});
			const fromTarget = jest.spyOn(
				(htmlvalidate as any).configLoader,
				"fromTarget"
			);
			const config = htmlvalidate.getConfigFor("my-file.html");
			expect(fromTarget).not.toHaveBeenCalled();
			expect(config.get()).toEqual(
				expect.objectContaining({
					root: true,
				})
			);
		});
	});

	it("getParserFor() should create a parser for given filename", () => {
		const htmlvalidate = new HtmlValidate();
		const config = Config.empty();
		jest.spyOn(htmlvalidate, "getConfigFor").mockImplementation(() => config);
		const source: Source = {
			data: "foo",
			filename: "inline",
			line: 1,
			column: 1,
		};
		const parser = htmlvalidate.getParserFor(source);
		expect(parser).toBeInstanceOf(Parser);
		expect(Parser).toHaveBeenCalledWith(config);
	});

	it("flushConfigCache() should delegate to configLoader", () => {
		const htmlvalidate = new HtmlValidate();
		const flush = jest.spyOn(
			(htmlvalidate as any).configLoader as ConfigLoader,
			"flush"
		);
		htmlvalidate.flushConfigCache("foo");
		expect(flush).toHaveBeenCalledWith("foo");
	});
});
