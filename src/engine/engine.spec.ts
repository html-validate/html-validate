import { Config } from "../config";
import { Engine } from "./engine";
import { Source } from "../context";
import { Parser } from "../parser";
import { DOMTree } from "../dom";
import { InvalidTokenError } from "../lexer";
import { Reporter } from "../reporter";
import { Rule } from "../rule";

function inline(source: string): Source {
	return {
		filename: 'inline',
		line: 1,
		column: 1,
		data: source,
	};
}

class MockParser extends Parser {
	public parseHtml(source: string|Source): DOMTree {
		if (typeof source == 'string') return null;
		switch (source.data){
		case 'parse-error':
			throw new InvalidTokenError({
				filename: source.filename,
				line: 1,
				column: 1,
			}, 'parse error');
		case 'exception':
			throw new Error('exception');
		default:
			return super.parseHtml(source);
		}
	}

	/* exposed for testing */
	public trigger(event: any, data: any): void {
		return super.trigger(event, data);
	}
}

class ExposedEngine<T extends Parser> extends Engine<T> {
	/* exposed for testing */
	public loadRule: typeof Engine.loadRule = Engine.loadRule;

	/* override class instantiation */
	public instantiateRule(name: string, options: any): Rule {  // eslint-disable-line no-unused-vars
		return null;
	}
}

describe('Engine', function(){

	let config: Config;
	let engine: ExposedEngine<Parser>;

	beforeEach(function(){
		config = Config.empty();
		engine = new ExposedEngine(config, MockParser);
	});

	describe('lint()', function(){

		it('should parse markup and return results', function(){
			const source: Source[] = [inline('<div></div>')];
			const report = engine.lint(source);
			expect(report).toBeValid();
			expect(report.results).toHaveLength(0);
		});

		it('should report lexing errors', function(){
			const source: Source[] = [inline('parse-error')]; // see MockParser, will raise InvalidTokenError
			const report = engine.lint(source);
			expect(report.valid).toBeFalsy();
			expect(report.results).toHaveLength(1);
			expect(report.results[0].messages).toEqual([{
				line: 1,
				column: 1,
				severity: 2,
				ruleId: undefined,
				message: "parse error",
			}]);
		});

		it('should pass exceptions', function(){
			const source: Source[] = [inline('exception')]; // see MockParser, will raise generic exception
			expect(() => engine.lint(source)).toThrow('exception');
		});

	});

	describe('dumpEvents()', function(){

		it('should dump parser events', function(){
			const source: Source[] = [inline('<div id="foo"><p class="bar">baz</p></div>')];
			const lines = engine.dumpEvents(source);
			expect(lines).toHaveLength(8);
			expect(lines[0].event).toEqual('dom:load');
			expect(lines[1].event).toEqual('tag:open');
			expect(lines[2].event).toEqual('attr');
			expect(lines[3].event).toEqual('tag:open');
			expect(lines[4].event).toEqual('attr');
			expect(lines[5].event).toEqual('tag:close');
			expect(lines[6].event).toEqual('tag:close');
			expect(lines[7].event).toEqual('dom:ready');
		});

	});

	describe('dumpTokens()', function(){

		it('should dump lexer tokens', function(){
			const source: Source[] = [inline('<div id="foo"><p class="bar">baz</p></div>')];
			const lines = engine.dumpTokens(source);
			expect(lines).toEqual([
				{token: 'TAG_OPEN', data: "<div", location: 'inline:1:1'},
				{token: 'WHITESPACE', data: " ", location: 'inline:1:5'},
				{token: 'ATTR_NAME', data: "id", location: 'inline:1:6'},
				{token: 'ATTR_VALUE', data: '="foo"', location: 'inline:1:8'},
				{token: 'TAG_CLOSE', data: ">", location: 'inline:1:14'},
				{token: 'TAG_OPEN', data: "<p", location: 'inline:1:15'},
				{token: 'WHITESPACE', data: " ", location: 'inline:1:17'},
				{token: 'ATTR_NAME', data: "class", location: 'inline:1:18'},
				{token: 'ATTR_VALUE', data: '="bar"', location: 'inline:1:23'},
				{token: 'TAG_CLOSE', data: ">", location: 'inline:1:29'},
				{token: 'TEXT', data: "baz", location: 'inline:1:30'},
				{token: 'TAG_OPEN', data: "</p", location: 'inline:1:33'},
				{token: 'TAG_CLOSE', data: ">", location: 'inline:1:36'},
				{token: 'TAG_OPEN', data: "</div", location: 'inline:1:37'},
				{token: 'TAG_CLOSE', data: ">", location: 'inline:1:42'},
				{token: 'EOF', data: null, location: 'inline:1:43'},
			]);
		});

	});

	describe('dumpTree()', function(){

		it('should dump DOM tree', function(){
			const source: Source[] = [inline('<div id="foo"><p class="bar">baz</p></div>')];
			const lines = engine.dumpTree(source);
			expect(lines).toEqual([
				'(root)',
				'└─┬ div#foo',
				'  └── p.bar',
			]);
		});

	});

	describe('internals', () => {

		describe('loadRule()', () => {

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

			it('should load and initialize rule', () => {
				engine.instantiateRule = jest.fn(() => mockRule);
				const rule = engine.loadRule('void', [Config.SEVERITY_ERROR, {}], parser, reporter);
				expect(rule).toBe(mockRule);
				expect(rule.init).toHaveBeenCalledWith(parser, reporter, Config.SEVERITY_ERROR);
				expect(rule.setup).toHaveBeenCalledWith();
				expect(rule.name).toEqual('void');
			});

			it('should use rule-defined name if set', () => {
				engine.instantiateRule = jest.fn(() => mockRule);
				mockRule.name = 'foobar';
				const rule = engine.loadRule('void', [Config.SEVERITY_ERROR, {}], parser, reporter);
				expect(rule.name).toEqual('foobar');
			});

			it('should add error if rule cannot be found', () => {
				engine.instantiateRule = jest.fn(() => {
					throw new Error('no such rule');
				});
				engine.loadRule('void', [Config.SEVERITY_ERROR, {}], parser, reporter);
				const add = jest.spyOn(reporter, 'add');
				parser.trigger('dom:load', {location: {}});
				expect(add).toHaveBeenCalledWith(null, expect.any(Rule), "Definition for rule 'void' was not found", Config.SEVERITY_ERROR, {});
			});

		});

	});

});
