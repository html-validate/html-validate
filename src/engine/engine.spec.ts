import { Config } from "../config";
import { Engine } from "./engine";
import { Source } from "../context";
import { Parser } from "../parser";
import { DOMTree } from "../dom";
import { InvalidTokenError } from "lexer";

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
}

describe('Engine', function(){

	const chai = require('chai');
	const expect = chai.expect;
	chai.use(require("chai-spies"));

	let config: Config;
	let engine: Engine<Parser>;

	beforeEach(function(){
		config = Config.empty();
		engine = new Engine(config, MockParser);
	});

	describe('lint()', function(){

		it('should parse markup and return results', function(){
			const source: Source[] = [inline('<div></div>')];
			const report = engine.lint(source);
			expect(report.valid).to.be.true;
			expect(report.results).to.have.length(0);
		});

		it('should report lexing errors', function(){
			const source: Source[] = [inline('parse-error')]; // see MockParser, will raise InvalidTokenError
			const report = engine.lint(source);
			expect(report.valid).to.be.false;
			expect(report.results).to.have.length(1);
			expect(report.results[0].messages).to.deep.equal([{
				line: 1,
				column: 1,
				severity: 2,
				ruleId: undefined,
				message: "parse error",
			}]);
		});

		it('should pass exceptions', function(){
			const source: Source[] = [inline('exception')]; // see MockParser, will raise generic exception
			expect(() => engine.lint(source)).to.throw('exception');
		});

	});

	describe('dumpEvents()', function(){

		it('should dump parser events', function(){
			const source: Source[] = [inline('<div id="foo"><p class="bar">baz</p></div>')];
			const lines = engine.dumpEvents(source);
			expect(lines).to.have.length(8);
			expect(lines[0]).to.match(/^dom:load/);
			expect(lines[1]).to.match(/^tag:open/);
			expect(lines[2]).to.match(/^attr/);
			expect(lines[3]).to.match(/^tag:open/);
			expect(lines[4]).to.match(/^attr/);
			expect(lines[5]).to.match(/^tag:close/);
			expect(lines[6]).to.match(/^tag:close/);
			expect(lines[7]).to.match(/^dom:ready/);
		});

	});

	describe('dumpTokens()', function(){

		it('should dump lexer tokens', function(){
			const source: Source[] = [inline('<div id="foo"><p class="bar">baz</p></div>')];
			const lines = engine.dumpTokens(source);
			expect(lines).to.deep.equal([
				'TOKEN: TAG_OPEN\n  Data: "<div"\n  Location: inline:1:1',
				'TOKEN: WHITESPACE\n  Data: " "\n  Location: inline:1:5',
				'TOKEN: ATTR_NAME\n  Data: "id"\n  Location: inline:1:6',
				'TOKEN: ATTR_VALUE\n  Data: "=\\"foo\\""\n  Location: inline:1:8',
				'TOKEN: TAG_CLOSE\n  Data: ">"\n  Location: inline:1:14',
				'TOKEN: TAG_OPEN\n  Data: "<p"\n  Location: inline:1:15',
				'TOKEN: WHITESPACE\n  Data: " "\n  Location: inline:1:17',
				'TOKEN: ATTR_NAME\n  Data: "class"\n  Location: inline:1:18',
				'TOKEN: ATTR_VALUE\n  Data: "=\\"bar\\""\n  Location: inline:1:23',
				'TOKEN: TAG_CLOSE\n  Data: ">"\n  Location: inline:1:29',
				'TOKEN: TEXT\n  Data: "baz"\n  Location: inline:1:30',
				'TOKEN: TAG_OPEN\n  Data: "</p"\n  Location: inline:1:33',
				'TOKEN: TAG_CLOSE\n  Data: ">"\n  Location: inline:1:36',
				'TOKEN: TAG_OPEN\n  Data: "</div"\n  Location: inline:1:37',
				'TOKEN: TAG_CLOSE\n  Data: ">"\n  Location: inline:1:42',
				'TOKEN: EOF\n  Data: null\n  Location: inline:1:43',
			]);
		});

	});

	describe('dumpTree()', function(){

		it('should dump DOM tree', function(){
			const source: Source[] = [inline('<div id="foo"><p class="bar">baz</p></div>')];
			const lines = engine.dumpTree(source);
			expect(lines).to.deep.equal([
				'(root)',
				'└─┬ div#foo',
				'  └── p.bar',
			]);
		});

	});

});
