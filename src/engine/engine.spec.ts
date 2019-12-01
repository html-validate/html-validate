import { Config, Severity } from "../config";
import { Source } from "../context";
import { DOMTree } from "../dom";
import { InvalidTokenError } from "../lexer";
import "../matchers";
import { MetaTable } from "../meta";
import { Parser } from "../parser";
import { Reporter } from "../reporter";
import { Rule, RuleOptions } from "../rule";
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
	public parseHtml(source: string | Source): DOMTree {
		if (typeof source === "string") return null;
		switch (source.data) {
			case "parse-error":
				throw new InvalidTokenError(
					{
						filename: source.filename,
						offset: 0,
						line: 1,
						column: 1,
					},
					"parse error"
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
		severity: Severity,
		options: any,
		parser: Parser,
		report: Reporter
	): Rule {
		return super.loadRule(name, severity, options, parser, report);
	}

	public requireRule(name: string, options: RuleOptions): any {
		return super.requireRule(name, options);
	}
}

describe("Engine", () => {
	let config: Config;
	let engine: ExposedEngine<Parser>;

	beforeEach(() => {
		config = Config.fromObject({
			extends: ["htmlvalidate:recommended"],
			rules: {
				deprecated: "off",
			},
		});
		config.init();
		engine = new ExposedEngine(config, MockParser);
	});

	describe("lint()", () => {
		it("should parse markup and return results", () => {
			const source: Source[] = [inline("<div></div>")];
			const report = engine.lint(source);
			expect(report).toBeValid();
			expect(report.results).toHaveLength(0);
		});

		it("should report lexing errors", () => {
			const source: Source[] = [inline("parse-error")]; // see MockParser, will raise InvalidTokenError
			const report = engine.lint(source);
			expect(report.valid).toBeFalsy();
			expect(report.results).toHaveLength(1);
			expect(report.results[0].messages).toEqual([
				{
					offset: 0,
					line: 1,
					column: 1,
					size: 0,
					severity: 2,
					ruleId: "parser-error",
					message: "parse error",
				},
			]);
		});

		it("should pass exceptions", () => {
			const source: Source[] = [inline("exception")]; // see MockParser, will raise generic exception
			expect(() => engine.lint(source)).toThrow("exception");
		});

		it("should report error for invalid markup", () => {
			const source: Source[] = [inline("<p></i>")];
			const report = engine.lint(source);
			expect(report).toBeInvalid();
			expect(report).toHaveError("close-order", expect.any(String));
		});

		it("should generate config:ready event", () => {
			const source: Source[] = [inline("<div></div>")];
			const parser = new Parser(config);
			const spy = jest.fn();
			parser.on("config:ready", spy);
			jest.spyOn(engine, "instantiateParser").mockReturnValue(parser);
			engine.lint(source);
			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy).toHaveBeenCalledWith("config:ready", {
				location: null,
				config: config.get(),
				rules: expect.anything(),
			});
		});
	});

	describe("directive", () => {
		it('"disable" should disable rule', () => {
			const source: Source[] = [
				inline("<!-- [html-validate-disable close-order] --><p></i><p></i>"),
			];
			const report = engine.lint(source);
			expect(report).toBeValid();
		});

		it('"enable" should enable rule', () => {
			const source: Source[] = [
				inline(
					"<!-- [html-validate-disable void] --><i/><!-- [html-validate-enable void] --><i/>"
				),
			];
			const report = engine.lint(source);
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([{ ruleId: "void", column: 80 }]);
		});

		it('"enable" set severity to error if off', () => {
			const source: Source[] = [
				inline(
					"<blink></blink><!-- [html-validate-enable deprecated] --><blink></blink>"
				),
			];
			const report = engine.lint(source);
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([{ ruleId: "deprecated", column: 59 }]);
		});

		it('"disable" should only disable selected rule', () => {
			const source: Source[] = [
				inline("<!-- [html-validate-disable foobar] --><p></i><p></i>"),
			];
			const report = engine.lint(source);
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([
				["close-order", expect.any(String)],
				["close-order", expect.any(String)],
			]);
		});

		it('"disable-block" should disable rule for all subsequent occurrences until block closes', () => {
			const source: Source[] = [
				inline(
					"<i/><div><i/><!-- [html-validate-disable-block void] --><i/><i/></div><i/>"
				),
			];
			const report = engine.lint(source);
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([
				{ ruleId: "void", column: 3 },
				{ ruleId: "void", column: 12 },
				{ ruleId: "void", column: 73 },
			]);
		});

		it('"disable-block" should disable rule on nodes', () => {
			const source: Source[] = [
				inline(
					'<div><input type="foo"><!-- [html-validate-disable-block attribute-allowed-values] --><input type="foo"></div><input type="foo">'
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
			const source: Source[] = [
				inline("<div><!-- [html-validate-disable-block void] --></div>"),
			];
			const report = engine.lint(source);
			expect(report).toBeValid();
		});

		it('"disable-block" should handle root element', () => {
			const source: Source[] = [
				inline("<!-- [html-validate-disable-block void] --><i/>"),
			];
			const report = engine.lint(source);
			expect(report).toBeValid();
		});

		it('"disable-block" should handle empty root element', () => {
			const source: Source[] = [
				inline("<!-- [html-validate-disable-block void] -->"),
			];
			const report = engine.lint(source);
			expect(report).toBeValid();
		});

		it('"disable-next" should disable rule once', () => {
			const source: Source[] = [
				inline(
					"<!-- [html-validate-disable-next close-order] --><p></i><p></i>"
				),
			];
			const report = engine.lint(source);
			expect(report).toBeInvalid();
			expect(report).toHaveError("close-order", expect.any(String));
		});

		it('"disable-next" should disable rule on nodes', () => {
			const source: Source[] = [
				inline(
					'<!-- [html-validate-disable-next attribute-allowed-values] --><input type="foo"><input type="foo">'
				),
			];
			const report = engine.lint(source);
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([
				{ ruleId: "attribute-allowed-values", column: 94 },
			]);
		});

		it("should report unknown directives", () => {
			const source: Source[] = [inline("<!-- [html-validate-foo] -->")];
			const report = engine.lint(source);
			expect(report).toBeInvalid();
			expect(report).toHaveError("parser-error", 'Unknown directive "foo"');
		});
	});

	describe("dumpEvents()", () => {
		it("should dump parser events", () => {
			const source: Source[] = [
				inline('<div id="foo"><p class="bar">baz</p></div>'),
			];
			const lines = engine.dumpEvents(source);
			expect(lines).toHaveLength(10);
			expect(lines[0].event).toEqual("dom:load");
			expect(lines[1].event).toEqual("tag:open");
			expect(lines[2].event).toEqual("attr");
			expect(lines[3].event).toEqual("tag:open");
			expect(lines[4].event).toEqual("attr");
			expect(lines[5].event).toEqual("tag:close");
			expect(lines[6].event).toEqual("element:ready");
			expect(lines[7].event).toEqual("tag:close");
			expect(lines[8].event).toEqual("element:ready");
			expect(lines[9].event).toEqual("dom:ready");
		});
	});

	describe("dumpTokens()", () => {
		it("should dump lexer tokens", () => {
			const source: Source[] = [
				inline('<div id="foo"><p class="bar">baz</p></div>'),
			];
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
				{ token: "EOF", data: null, location: "inline:1:43" },
			]);
		});
	});

	describe("dumpTree()", () => {
		it("should dump DOM tree", () => {
			const source: Source[] = [
				inline(
					'<div id="foo"><p class="bar">baz</p><ul><li>fred</li><li>barney</li></ul></div>'
				),
			];
			const lines = engine.dumpTree(source);
			expect(lines).toMatchSnapshot();
		});
	});

	describe("getRuleDocumentation()", () => {
		it("should get rule documentation", () => {
			const docs = engine.getRuleDocumentation("void");
			expect(docs).toEqual({
				description: expect.any(String),
				url: expect.any(String),
			});
		});

		it("should return null if rule is unknown", () => {
			const docs = engine.getRuleDocumentation("missing-rule");
			expect(docs).toBeNull();
		});
	});

	describe("internals", () => {
		describe("loadRule()", () => {
			let parser: MockParser;
			let reporter: Reporter;
			let mockRule: any;

			beforeEach(() => {
				parser = new MockParser(config);
				reporter = new Reporter();
				mockRule = {
					init: jest.fn(),
					setup: jest.fn(),
				};
			});

			it("should load and initialize rule", () => {
				engine.requireRule = jest.fn(() => mockRule);
				const rule = engine.loadRule(
					"void",
					Severity.ERROR,
					{},
					parser,
					reporter
				);
				expect(rule).toBe(mockRule);
				expect(rule.init).toHaveBeenCalledWith(
					parser,
					reporter,
					Severity.ERROR,
					expect.any(MetaTable)
				);
				expect(rule.setup).toHaveBeenCalledWith();
				expect(rule.name).toEqual("void");
			});

			it("should use rule-defined name if set", () => {
				engine.requireRule = jest.fn(() => mockRule);
				mockRule.name = "foobar";
				const rule = engine.loadRule(
					"void",
					Severity.ERROR,
					{},
					parser,
					reporter
				);
				expect(rule.name).toEqual("foobar");
			});

			it("should add error if rule cannot be found", () => {
				engine.requireRule = jest.fn(() => null);
				engine.loadRule("void", Severity.ERROR, {}, parser, reporter);
				const add = jest.spyOn(reporter, "add");
				parser.trigger("dom:load", { location: null });
				expect(add).toHaveBeenCalledWith(
					expect.any(Rule),
					"Definition for rule 'void' was not found",
					Severity.ERROR,
					{},
					undefined
				);
			});

			it("should load from plugins", () => {
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

				const engine: ExposedEngine<Parser> = new ExposedEngine(
					config,
					MockParser
				);
				const rule = engine.loadRule(
					"custom/my-rule",
					Severity.ERROR,
					{},
					parser,
					reporter
				);
				expect(rule).toBeInstanceOf(MyRule);
				expect(rule.name).toEqual("custom/my-rule");
			});

			it("should handle missing setup callback", () => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore: abstract method not implemented, but plugin might be vanilla js so want to handle the case
				class MyRule extends Rule {}

				/* mock loading of plugins */
				(config as any).plugins = [
					{
						rules: {
							"custom/my-rule": MyRule,
						},
					},
				];

				const engine: ExposedEngine<Parser> = new ExposedEngine(
					config,
					MockParser
				);
				const rule = engine.loadRule(
					"custom/my-rule",
					Severity.ERROR,
					{},
					parser,
					reporter
				);
				expect(rule).toBeInstanceOf(MyRule);
			});

			it("should handle plugin without rules", () => {
				/* mock loading of plugins */
				(config as any).plugins = [{}];
				expect(() => new ExposedEngine(config, MockParser)).not.toThrow();
			});
		});
	});
});
