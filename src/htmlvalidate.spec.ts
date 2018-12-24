import { Config, ConfigLoader } from "./config";
import { Source } from "./context";
import { Engine } from "./engine";
import HtmlValidate from "./htmlvalidate";
import { Parser } from "./parser";

jest.mock("./engine");
jest.mock("./parser");

function engineInstance(): Engine {
	return (Engine as unknown as jest.MockInstance<Engine>).mock.instances[0];
}

function mockConfig(): Config {
	const config = Config.empty();
	config.init();
	config.transform = jest.fn((filename: string) => ([{
		column: 1,
		data: `source from ${filename}`,
		filename,
		line: 1,
	}]));
	return config;
}

beforeEach(() => {
	(Engine as unknown as jest.MockInstance<Engine>).mockClear();
});

describe("HtmlValidate", () => {

	it("should load default config if no configuration was passed", () => {
		const htmlvalidate = new HtmlValidate();
		expect((htmlvalidate as any).globalConfig.config).toEqual(expect.objectContaining({
			extends: ["htmlvalidate:recommended"],
		}));
	});

	it("should not load default config if configuration was passed", () => {
		const htmlvalidate = new HtmlValidate({});
		expect((htmlvalidate as any).globalConfig.config).toEqual(expect.objectContaining({
			extends: [],
		}));
	});

	it("validateString() should lint given string", () => {
		const htmlvalidate = new HtmlValidate();
		const str = "foobar";
		htmlvalidate.validateString(str);
		const engine = engineInstance();
		expect(engine.lint).toHaveBeenCalledWith([{
			column: 1,
			data: str,
			filename: "inline",
			line: 1,
		}]);
	});

	it("validateSource() should lint given source", () => {
		const htmlvalidate = new HtmlValidate();
		const source: Source = {data: "foo", filename: "inline", line: 1, column: 1};
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
		expect(engine.lint).toHaveBeenCalledWith([{
			column: 1,
			data: "source from foo.html",
			filename,
			line: 1,
		}]);
	});

	it("dumpTokens() should dump tokens", () => {
		const htmlvalidate = new HtmlValidate();
		const filename = "foo.html";
		jest.spyOn(htmlvalidate, "getConfigFor").mockImplementation(mockConfig);
		htmlvalidate.dumpTokens(filename);
		const engine = engineInstance();
		expect(engine.dumpTokens).toHaveBeenCalledWith([{
			column: 1,
			data: "source from foo.html",
			filename,
			line: 1,
		}]);
	});

	it("dumpEvents() should dump events", () => {
		const htmlvalidate = new HtmlValidate();
		const filename = "foo.html";
		jest.spyOn(htmlvalidate, "getConfigFor").mockImplementation(mockConfig);
		htmlvalidate.dumpEvents(filename);
		const engine = engineInstance();
		expect(engine.dumpEvents).toHaveBeenCalledWith([{
			column: 1,
			data: "source from foo.html",
			filename,
			line: 1,
		}]);
	});

	it("dumpTree() should dump tree", () => {
		const htmlvalidate = new HtmlValidate();
		const filename = "foo.html";
		jest.spyOn(htmlvalidate, "getConfigFor").mockImplementation(mockConfig);
		htmlvalidate.dumpTree(filename);
		const engine = engineInstance();
		expect(engine.dumpTree).toHaveBeenCalledWith([{
			column: 1,
			data: "source from foo.html",
			filename,
			line: 1,
		}]);
	});

	it("getParserFor() should create a parser for given filename", () => {
		const htmlvalidate = new HtmlValidate();
		const config = {foo: "bar"};
		jest.spyOn(htmlvalidate, "getConfigFor").mockImplementation(() => config);
		const source: Source = {data: "foo", filename: "inline", line: 1, column: 1};
		const parser = htmlvalidate.getParserFor(source);
		expect(parser).toBeInstanceOf(Parser);
		expect(Parser).toHaveBeenCalledWith(config);
	});

	it("flushConfigCache() should delegate to configLoader", () => {
		const htmlvalidate = new HtmlValidate();
		const flush = jest.spyOn((htmlvalidate as any).configLoader as ConfigLoader, "flush");
		htmlvalidate.flushConfigCache("foo");
		expect(flush).toHaveBeenCalledWith("foo");
	});

});
