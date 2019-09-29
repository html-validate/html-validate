import { Config, ConfigLoader } from "./config";
import { Source } from "./context";
import { Engine } from "./engine";
import HtmlValidate from "./htmlvalidate";
import { Parser } from "./parser";

jest.mock("./engine");
jest.mock("./parser");

function engineInstance(): Engine {
	return ((Engine as unknown) as jest.MockInstance<Engine, any>).mock
		.instances[0];
}

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
	((Engine as unknown) as jest.MockInstance<Engine, any>).mockClear();
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

	it("validateString() should lint given string", () => {
		const htmlvalidate = new HtmlValidate();
		const str = "foobar";
		htmlvalidate.validateString(str);
		const engine = engineInstance();
		expect(engine.lint).toHaveBeenCalledWith([
			{
				column: 1,
				data: str,
				filename: "inline",
				line: 1,
			},
		]);
	});

	it("validateSource() should lint given source", () => {
		const htmlvalidate = new HtmlValidate();
		const source: Source = {
			data: "foo",
			filename: "inline",
			line: 1,
			column: 1,
		};
		htmlvalidate.validateSource(source);
		const engine = engineInstance();
		expect(engine.lint).toHaveBeenCalledWith([source]);
	});

	it("validateFile() should lint given file", () => {
		const htmlvalidate = new HtmlValidate();
		const filename = "foo.html";
		jest.spyOn(htmlvalidate, "getConfigFor").mockImplementation(mockConfig);
		htmlvalidate.validateFile(filename);
		const engine = engineInstance();
		expect(engine.lint).toHaveBeenCalledWith([
			{
				column: 1,
				data: "source from foo.html",
				filename,
				line: 1,
			},
		]);
	});

	it("dumpTokens() should dump tokens", () => {
		const htmlvalidate = new HtmlValidate();
		const filename = "foo.html";
		jest.spyOn(htmlvalidate, "getConfigFor").mockImplementation(mockConfig);
		htmlvalidate.dumpTokens(filename);
		const engine = engineInstance();
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
		const engine = engineInstance();
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
		const engine = engineInstance();
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
		const engine = engineInstance();
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
