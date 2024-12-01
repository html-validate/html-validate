import { type ResolvedConfig, type RuleOptions, Config, Severity } from "../config";
import { type Source } from "../context";
import { type HtmlElement } from "../dom";
import { InvalidTokenError } from "../lexer";
import "../jest";
import { MetaTable } from "../meta";
import { Parser, ParserError } from "../parser";
import { Reporter } from "../reporter";
import { Rule } from "../rule";
import { type ConfigReadyEvent, type DOMLoadEvent, EventHandler } from "../event";
import { type Plugin } from "../plugin";
import { Engine } from "./engine";

function inline(source: string): Source {
	return {
		filename: "inline",
		line: 1,
		column: 1,
		offset: 0,
		data: source,
	};
}

class MockParser extends Parser {
	public parseHtml(source: string | Source): HtmlElement {
		if (typeof source === "string") return super.parseHtml(source);
		switch (source.data) {
			case "invalid-token-error":
				throw new InvalidTokenError(
					{
						filename: source.filename,
						line: 1,
						column: 1,
						offset: 0,
						size: 1,
					},
					"invalid token error",
				);
			case "parser-error":
				throw new ParserError(
					{
						filename: source.filename,
						line: 1,
						column: 1,
						offset: 0,
						size: 1,
					},
					"parser error",
				);
			case "exception":
				throw new Error("exception");
			default:
				return super.parseHtml(source);
		}
	}
}

class ExposedEngine<T extends Parser> extends Engine<T> {
	/* exposed for testing */
	public loadRule(
		name: string,
		resolvedConfig: ResolvedConfig,
		severity: Severity,
		options: any,
		parser: Parser,
		report: Reporter,
	): Rule<unknown, unknown> {
		return super.loadRule(name, resolvedConfig, severity, options, parser, report);
	}

	/* exposed for testing */
	public instantiateRule(name: string, options: RuleOptions): Rule<unknown, unknown> {
		return super.instantiateRule(name, options);
	}

	/* exposed for testing */
	public missingRule(name: string): Rule {
		return super.missingRule(name);
	}
}

describe("Engine", () => {
	let config: Config;
	let resolvedConfig: ResolvedConfig;
	let engine: ExposedEngine<Parser>;

	beforeEach(async () => {
		config = await Config.fromObject([], {
			extends: ["html-validate:recommended"],
			rules: {
				deprecated: "off",
				"no-unused-disable": "off",
			},
		});
		resolvedConfig = await config.resolve();
		engine = new ExposedEngine(resolvedConfig, MockParser);
	});

	describe("lint()", () => {
		it("should parse markup and return results", () => {
			expect.assertions(2);
			const source: Source[] = [inline("<div></div>")];
			const report = engine.lint(source);
			expect(report).toBeValid();
			expect(report.results).toHaveLength(0);
		});

		it("should report lexing errors", () => {
			expect.assertions(3);
			const source: Source[] = [inline("invalid-token-error")]; // see MockParser, will raise InvalidTokenError
			const report = engine.lint(source);
			expect(report.valid).toBeFalsy();
			expect(report.results).toHaveLength(1);
			expect(report.results[0]).toMatchInlineSnapshot(`
				{
				  "errorCount": 1,
				  "filePath": "inline",
				  "messages": [
				    {
				      "column": 1,
				      "line": 1,
				      "message": "invalid token error",
				      "offset": 0,
				      "ruleId": "parser-error",
				      "selector": null,
				      "severity": 2,
				      "size": 1,
				    },
				  ],
				  "source": "invalid-token-error",
				  "warningCount": 0,
				}
			`);
		});

		it("should report parser errors", () => {
			expect.assertions(3);
			const source: Source[] = [inline("parser-error")]; // see MockParser, will raise ParserError
			const report = engine.lint(source);
			expect(report.valid).toBeFalsy();
			expect(report.results).toHaveLength(1);
			expect(report.results[0]).toMatchInlineSnapshot(`
				{
				  "errorCount": 1,
				  "filePath": "inline",
				  "messages": [
				    {
				      "column": 1,
				      "line": 1,
				      "message": "parser error",
				      "offset": 0,
				      "ruleId": "parser-error",
				      "selector": null,
				      "severity": 2,
				      "size": 1,
				    },
				  ],
				  "source": "parser-error",
				  "warningCount": 0,
				}
			`);
		});

		it("should pass exceptions", () => {
			expect.assertions(1);
			const source: Source[] = [inline("exception")]; // see MockParser, will raise generic exception
			expect(() => engine.lint(source)).toThrow("exception");
		});

		it("should report error for invalid markup", () => {
			expect.assertions(2);
			const source: Source[] = [inline("<div>")];
			const report = engine.lint(source);
			expect(report).toBeInvalid();
			expect(report).toHaveError("close-order", expect.any(String));
		});

		it("should generate config:ready event", async () => {
			expect.assertions(5);
			const source: Source[] = [inline("<div></div>")];
			const resolved = await config.resolve();
			const parser = new Parser(resolved);
			const spy = jest.fn();
			parser.on("config:ready", spy);
			jest.spyOn(engine, "instantiateParser").mockReturnValue(parser);
			engine.lint(source);
			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy).toHaveBeenCalledWith("config:ready", expect.anything());
			const event = spy.mock.calls[0][1] as ConfigReadyEvent;
			expect(event.location).toMatchInlineSnapshot(`
				{
				  "column": 1,
				  "filename": "inline",
				  "line": 1,
				  "offset": 0,
				  "size": 1,
				}
			`);
			expect(event.config).toEqual(resolved);
			expect(event.rules).toBeDefined();
		});

		it("should generate source:ready event", async () => {
			expect.assertions(3);
			const source: Source[] = [inline("<div></div>"), inline("<p></i>")];
			const resolvedConfig = await config.resolve();
			const parser = new Parser(resolvedConfig);
			const spy = jest.fn();
			parser.on("source:ready", spy);
			jest.spyOn(engine, "instantiateParser").mockReturnValue(parser);
			engine.lint(source);
			expect(spy).toHaveBeenCalledTimes(2);
			expect(spy).toHaveBeenCalledWith("source:ready", {
				location: {
					filename: "inline",
					line: 1,
					column: 1,
					offset: 0,
					size: 1,
				},
				source: {
					filename: "inline",
					data: "<div></div>",
					line: 1,
					column: 1,
					offset: 0,
				},
			});
			expect(spy).toHaveBeenCalledWith("source:ready", {
				location: {
					filename: "inline",
					line: 1,
					column: 1,
					offset: 0,
					size: 1,
				},
				source: {
					filename: "inline",
					data: "<p></i>",
					line: 1,
					column: 1,
					offset: 0,
				},
			});
		});
	});

	describe("directive", () => {
		it('"disable" should disable rule', () => {
			expect.assertions(1);
			const source: Source[] = [
				inline("<!-- [html-validate-disable close-order] --><div></i><div></i>"),
			];
			const report = engine.lint(source);
			expect(report).toBeValid();
		});

		it('"enable" should enable rule', () => {
			expect.assertions(2);
			const source: Source[] = [
				inline(
					"<!-- [html-validate-disable no-self-closing] --><i/><!-- [html-validate-enable no-self-closing] --><i/>",
				),
			];
			const report = engine.lint(source);
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([{ ruleId: "no-self-closing", column: 102 }]);
		});

		it('"enable" set severity to error if off', () => {
			expect.assertions(2);
			const source: Source[] = [
				inline("<blink></blink><!-- [html-validate-enable deprecated] --><blink></blink>"),
			];
			const report = engine.lint(source);
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([{ ruleId: "deprecated", column: 59 }]);
		});

		it('"disable" should only disable selected rule', () => {
			expect.assertions(2);
			const source: Source[] = [inline("<!-- [html-validate-disable foobar] --><div></i>")];
			const report = engine.lint(source);
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([
				["close-order", expect.any(String)],
				["close-order", expect.any(String)],
			]);
		});

		it('"disable-block" should disable rule for all subsequent occurrences until block closes', () => {
			expect.assertions(2);
			const source: Source[] = [
				inline(
					"<i/><div><i/><!-- [html-validate-disable-block no-self-closing] --><i/><i/></div><i/>",
				),
			];
			const report = engine.lint(source);
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([
				{ ruleId: "no-self-closing", column: 3 },
				{ ruleId: "no-self-closing", column: 12 },
				{ ruleId: "no-self-closing", column: 84 },
			]);
		});

		it('"disable-block" should disable rule on nodes', () => {
			expect.assertions(2);
			const source: Source[] = [
				inline(
					'<div><input type="foo"><!-- [html-validate-disable-block attribute-allowed-values] --><input type="foo"></div><input type="foo">',
				),
			];
			const report = engine.lint(source);
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([
				{ ruleId: "attribute-allowed-values", column: 19 },
				{ ruleId: "attribute-allowed-values", column: 124 },
			]);
		});

		it('"disable-block" should handle empty block', () => {
			expect.assertions(1);
			const source: Source[] = [
				inline("<div><!-- [html-validate-disable-block no-self-closing] --></div>"),
			];
			const report = engine.lint(source);
			expect(report).toBeValid();
		});

		it('"disable-block" should handle root element', () => {
			expect.assertions(1);
			const source: Source[] = [
				inline("<!-- [html-validate-disable-block no-self-closing] --><i/>"),
			];
			const report = engine.lint(source);
			expect(report).toBeValid();
		});

		it('"disable-block" should handle empty root element', () => {
			expect.assertions(1);
			const source: Source[] = [inline("<!-- [html-validate-disable-block no-self-closing] -->")];
			const report = engine.lint(source);
			expect(report).toBeValid();
		});

		describe('"disable-next"', () => {
			it("should disable next error on element", () => {
				expect.assertions(1);
				const markup = `
					<!-- [html-validate-disable-next void-style] -->
					<input type="hidden" />
				`;
				const source: Source[] = [inline(markup)];
				const report = engine.lint(source);
				expect(report).toBeValid();
			});

			it("should disable next error once", () => {
				expect.assertions(2);
				const markup = `
					<!-- [html-validate-disable-next void-style] -->
					<input type="hidden" />
					<input type="hidden" />
				`;
				const source: Source[] = [inline(markup)];
				const report = engine.lint(source);
				expect(report).toBeInvalid();
				expect(report).toHaveError("void-style", expect.any(String));
			});

			it("should be canceled by end tag", () => {
				expect.assertions(2);
				const markup = `
					<div>
						<!-- [html-validate-disable-next void-style] -->
					</div>
					<input type="hidden" />
				`;
				const source: Source[] = [inline(markup)];
				const report = engine.lint(source);
				expect(report).toBeInvalid();
				expect(report).toHaveError("void-style", expect.any(String));
			});
		});

		it('"disable-next" should disable rule on nodes', () => {
			expect.assertions(2);
			const source: Source[] = [
				inline(
					'<!-- [html-validate-disable-next attribute-allowed-values] --><input type="foo"><input type="foo">',
				),
			];
			const report = engine.lint(source);
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([{ ruleId: "attribute-allowed-values", column: 94 }]);
		});

		it("should report unknown directives", () => {
			expect.assertions(2);
			const source: Source[] = [inline("<!-- [html-validate-foo] -->")];
			const report = engine.lint(source);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Unknown directive "foo" (parser-error) at inline:1:1:
				> 1 | <!-- [html-validate-foo] -->
				    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
				Selector: -"
			`);
		});
	});

	describe("dumpEvents()", () => {
		it("should dump parser events", () => {
			expect.assertions(15);
			const source: Source[] = [inline('<div id="foo"><p class="bar">baz</p></div>')];
			const lines = engine.dumpEvents(source);
			expect(lines).toHaveLength(14);
			expect(lines[0].event).toBe("parse:begin");
			expect(lines[1].event).toBe("dom:load");
			expect(lines[2].event).toBe("tag:start");
			expect(lines[3].event).toBe("attr");
			expect(lines[4].event).toBe("tag:ready");
			expect(lines[5].event).toBe("tag:start");
			expect(lines[6].event).toBe("attr");
			expect(lines[7].event).toBe("tag:ready");
			expect(lines[8].event).toBe("tag:end");
			expect(lines[9].event).toBe("element:ready");
			expect(lines[10].event).toBe("tag:end");
			expect(lines[11].event).toBe("element:ready");
			expect(lines[12].event).toBe("dom:ready");
			expect(lines[13].event).toBe("parse:end");
		});
	});

	describe("dumpTokens()", () => {
		it("should dump lexer tokens", () => {
			expect.assertions(1);
			const source: Source[] = [inline('<div id="foo"><p class="bar">baz</p></div>')];
			const lines = engine.dumpTokens(source);
			expect(lines).toEqual([
				{ token: "TAG_OPEN", data: "<div", location: "inline:1:1" },
				{ token: "WHITESPACE", data: " ", location: "inline:1:5" },
				{ token: "ATTR_NAME", data: "id", location: "inline:1:6" },
				{ token: "ATTR_VALUE", data: '="foo"', location: "inline:1:8" },
				{ token: "TAG_CLOSE", data: ">", location: "inline:1:14" },
				{ token: "TAG_OPEN", data: "<p", location: "inline:1:15" },
				{ token: "WHITESPACE", data: " ", location: "inline:1:17" },
				{ token: "ATTR_NAME", data: "class", location: "inline:1:18" },
				{ token: "ATTR_VALUE", data: '="bar"', location: "inline:1:23" },
				{ token: "TAG_CLOSE", data: ">", location: "inline:1:29" },
				{ token: "TEXT", data: "baz", location: "inline:1:30" },
				{ token: "TAG_OPEN", data: "</p", location: "inline:1:33" },
				{ token: "TAG_CLOSE", data: ">", location: "inline:1:36" },
				{ token: "TAG_OPEN", data: "</div", location: "inline:1:37" },
				{ token: "TAG_CLOSE", data: ">", location: "inline:1:42" },
				{ token: "EOF", data: "", location: "inline:1:43" },
			]);
		});
	});

	describe("dumpTree()", () => {
		it("should dump DOM tree", () => {
			expect.assertions(1);
			const source: Source[] = [
				inline('<div id="foo"><p class="bar">baz</p><ul><li>fred</li><li>barney</li></ul></div>'),
			];
			const lines = engine.dumpTree(source);
			expect(lines).toMatchSnapshot();
		});
	});

	describe("getRuleDocumentation()", () => {
		it("should get rule documentation", () => {
			expect.assertions(1);
			const docs = engine.getRuleDocumentation({
				ruleId: "void-style",
				context: { style: 1, tagName: "foo" },
			});
			expect(docs).toEqual({
				description: expect.any(String),
				url: expect.any(String),
			});
		});

		it("should return null if rule is unknown", () => {
			expect.assertions(1);
			const docs = engine.getRuleDocumentation({ ruleId: "missing-rule" });
			expect(docs).toBeNull();
		});
	});

	describe("plugins", () => {
		it("should call init callback if present", async () => {
			expect.assertions(1);

			const plugin: Plugin = {
				init: jest.fn(),
			};

			/* mock loading of plugins */
			(config as any).plugins = [plugin];

			const source = inline("");
			const resolvedConfig = await config.resolve();
			const engine = new ExposedEngine(resolvedConfig, MockParser);
			engine.lint([source]);
			expect(plugin.init).toHaveBeenCalledWith();
		});

		it("should call setup callback if present", async () => {
			expect.assertions(1);

			const plugin: Plugin = {
				setup: jest.fn(),
			};

			/* mock loading of plugins */
			(config as any).plugins = [plugin];

			const source = inline("");
			const resolvedConfig = await config.resolve();
			const engine = new ExposedEngine(resolvedConfig, MockParser);
			engine.lint([source]);
			expect(plugin.setup).toHaveBeenCalledWith(source, expect.any(EventHandler));
		});
	});

	describe("internals", () => {
		describe("loadRule()", () => {
			let parser: MockParser;
			let reporter: Reporter;
			let mockRule: any;

			beforeEach(async () => {
				parser = new MockParser(await config.resolve());
				reporter = new Reporter();
				mockRule = {
					init: jest.fn(),
					setup: jest.fn(),
				};
			});

			it("should load and initialize rule", async () => {
				expect.assertions(4);
				const resolvedConfig = await config.resolve();
				jest.spyOn(engine, "instantiateRule").mockReturnValueOnce(mockRule);
				const rule = engine.loadRule("void", resolvedConfig, Severity.ERROR, {}, parser, reporter);
				expect(rule).toBe(mockRule);
				expect(rule.init).toHaveBeenCalledWith(
					parser,
					reporter,
					Severity.ERROR,
					expect.any(MetaTable),
				);
				expect(rule.setup).toHaveBeenCalledWith();
				expect(rule.name).toBe("void");
			});

			it("should add error if rule cannot be found", async () => {
				expect.assertions(1);
				const resolvedConfig = await config.resolve();
				engine.loadRule("foobar", resolvedConfig, Severity.ERROR, {}, parser, reporter);
				const add = jest.spyOn(reporter, "add");
				const location = {
					filename: "inline",
					line: 1,
					column: 1,
					offset: 0,
					size: 1,
				};
				const event: DOMLoadEvent = {
					location,
					source: inline("<div></div>"),
				};
				parser.trigger("dom:load", event);
				expect(add).toHaveBeenCalledWith(
					expect.any(Rule),
					"Definition for rule 'foobar' was not found",
					Severity.ERROR,
					null,
					location,
					undefined,
				);
			});

			it("should load from plugins", async () => {
				expect.assertions(2);
				class MyRule extends Rule {
					public setup(): void {
						/* do nothing */
					}
				}

				/* mock loading of plugins */
				(config as any).plugins = [
					{
						rules: {
							"custom/my-rule": MyRule,
						},
					},
				];

				const resolvedConfig = await config.resolve();
				const engine = new ExposedEngine<Parser>(resolvedConfig, MockParser);
				const rule = engine.loadRule(
					"custom/my-rule",
					resolvedConfig,
					Severity.ERROR,
					{},
					parser,
					reporter,
				);
				expect(rule).toBeInstanceOf(MyRule);
				expect(rule.name).toBe("custom/my-rule");
			});

			it("should handle plugin setting rule to null", async () => {
				expect.assertions(1);

				/* mock loading of plugins */
				(config as any).plugins = [
					{
						rules: {
							"custom/my-rule": null,
						},
					},
				];

				const resolvedConfig = await config.resolve();
				const engine = new ExposedEngine<Parser>(resolvedConfig, MockParser);
				const missingRule = jest.spyOn(engine, "missingRule");
				engine.loadRule("custom/my-rule", resolvedConfig, Severity.ERROR, {}, parser, reporter);
				expect(missingRule).toHaveBeenCalledWith("custom/my-rule");
			});

			it("should handle missing setup callback", async () => {
				expect.assertions(1);
				// @ts-expect-error: abstract method not implemented, but plugin might be vanilla js so want to handle the case
				class MyRule extends Rule {}

				/* mock loading of plugins */
				(config as any).plugins = [
					{
						rules: {
							"custom/my-rule": MyRule,
						},
					},
				];

				const resolvedConfig = await config.resolve();
				const engine = new ExposedEngine<Parser>(resolvedConfig, MockParser);
				const rule = engine.loadRule(
					"custom/my-rule",
					resolvedConfig,
					Severity.ERROR,
					{},
					parser,
					reporter,
				);
				expect(rule).toBeInstanceOf(MyRule);
			});

			it("should handle plugin without rules", async () => {
				expect.assertions(1);
				/* mock loading of plugins */
				(config as any).plugins = [{}];
				const resolvedConfig = await config.resolve();
				expect(() => new ExposedEngine(resolvedConfig, MockParser)).not.toThrow();
			});
		});
	});
});
