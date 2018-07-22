import { Config } from "../config";
import { Engine } from "./engine";
import { Source } from "../context";

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

	describe('lint()', function(){

		it('should parse markup and return results', function(){
			const source: Source[] = [inline('<div></div>')];
			const report = engine.lint(source);
			expect(report.valid).to.be.true;
			expect(report.results).to.have.length(0);
		});

		it('should report lexing errors', function(){
			const source: Source[] = [inline('<=')];
			const report = engine.lint(source);
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
