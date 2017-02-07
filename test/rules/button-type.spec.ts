import HtmlLint from '../../src/htmllint';

describe('rule button-type', function(){

	const expect = require('chai').expect;

	let htmllint;

	before(function(){
		htmllint = new HtmlLint({
			rules: {'button-type': 'error'},
		});
	});

	it('should not report when button has type="submit"', function(){
		let report = htmllint.string('<button type="submit"></button>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report when button has type="button"', function(){
		let report = htmllint.string('<button type="button"></button>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report when button has type="reset"', function(){
		let report = htmllint.string('<button type="reset"></button>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should report error when type attribute is missing', function(){
		let report = htmllint.string('<button></button>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 3 errors").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be button-type").to.equal('button-type');
	});

	it('should report error when type attribute is invalid', function(){
		let report = htmllint.string('<button></button>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 3 errors").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be button-type").to.equal('button-type');
	});

});
