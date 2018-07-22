/* eslint-disable dot-notation */
import { Config } from "../config";
import { Engine } from "./engine";
import { Source } from "../context";
import { InvalidTokenError } from "lexer";

function inline(source: string): Source {
	return {
		filename: 'inline',
		line: 1,
		column: 1,
		data: source,
	};
}

describe('Engine', function(){

	const chai = require('chai');
	const expect = chai.expect;
	chai.use(require("chai-spies"));

	let config: Config;
	let engine: Engine;

	beforeEach(function(){
		config = Config.empty();
		engine = new Engine(config);
	});

	describe('process()', function(){

		it('should delegate mode lint', function(){
			engine['parse'] = chai.spy();
			engine.process([], 'lint');
			expect(engine['parse']).to.have.been.called.with([]);
		});

		it('should delegate mode dump-events', function(){
			engine['dumpEvents'] = chai.spy();
			engine.process([], 'dump-events');
			expect(engine['dumpEvents']).to.have.been.called.with([]);
		});

		it('should delegate mode dump-tokens', function(){
			engine['dumpTokens'] = chai.spy();
			engine.process([], 'dump-tokens');
			expect(engine['dumpTokens']).to.have.been.called.with([]);
		});

		it('should delegate mode dump-tree', function(){
			engine['dumpTree'] = chai.spy();
			engine.process([], 'dump-tree');
			expect(engine['dumpTree']).to.have.been.called.with([]);
		});

		it('should throw exception on invalid mode', function(){
			expect(() => {
				engine.process([], 'invalid');
			}).to.throw('Unknown mode "invalid"');
		});

		it('should default to lint', function(){
			engine['parse'] = chai.spy();
			engine.process([]);
			expect(engine['parse']).to.have.been.called.with([]);
		});

	});

	describe('parse()', function(){

		it('should parse markup and return results', function(){
			const source: Source[] = [inline('<div></div>')];
			const report = engine.process(source);
			expect(report.valid).to.be.true;
			expect(report.results).to.have.length(0);
		});

		it('should report lexing errors', function(){
			const source: Source[] = [inline('<=')];
			const report = engine.process(source);
			expect(report.valid).to.be.false;
			expect(report.results).to.have.length(1);
			expect(report.results[0].messages).to.deep.equal([{
				line: 1,
				column: 1,
				severity: 2,
				ruleId: undefined,
				message: "failed to tokenize \"<=\", state TEXT failed to consume data or change state.",
			}]);
		});

	});

});
