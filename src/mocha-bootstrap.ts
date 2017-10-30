import { Report } from './reporter';
import { Token, TokenType } from 'lexer';

const chai = require('chai');

chai.use(require('chai-subset'));

chai.use(function(chai: any, utils: any){
	function expectValid(){
		const report = utils.flag(this, 'object') as Report;
		if (!report.valid){
			const actual = report.results[0].messages[0].message;
			new chai.Assertion(actual, 'Result should not contain error').to.be.undefined;
		}
		new chai.Assertion(report.valid, 'Result should be successful').to.be.true;
	}

	function expectInvalid(){
		const report = utils.flag(this, 'object') as Report;
		new chai.Assertion(report.valid, 'Result should be failure').to.be.false;
	}

	function expectError(expectedRule: string, expectedMessage: string|RegExp){
		const report = utils.flag(this, 'object') as Report;
		new chai.Assertion(report.results, 'Result should contain an error').to.have.lengthOf(1);
		const actual = report.results[0].messages[0];
		new chai.Assertion(actual.ruleId).to.be.equal(expectedRule);
		if (expectedMessage instanceof RegExp){
			new chai.Assertion(actual.message).to.match(expectedMessage);
		} else {
			new chai.Assertion(actual.message).to.be.equal(expectedMessage);
		}
	}

	function expectToken(expected: any){
		const actual = utils.flag(this, 'object').value as Token;
		if (expected.type){
			new chai.Assertion(TokenType[actual.type]).to.be.equal(TokenType[expected.type]);
		}
		new chai.Assertion(actual).to.containSubset(expected);
	}

	chai.Assertion.addProperty('valid', expectValid);
	chai.Assertion.addProperty('invalid', expectInvalid);
	chai.Assertion.addMethod('error', expectError);
	chai.Assertion.addMethod('token', expectToken);
});
