import HtmlLint from '../htmllint';

describe('rule button-type', function(){

	const expect = require('chai').expect;

	let htmllint: HtmlLint;

	before(function(){
		htmllint = new HtmlLint({
			rules: {'button-type': 'error'},
		});
	});

	it('should not report when button has type="submit"', function(){
		const report = htmllint.string('<button type="submit"></button>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report when button has type="button"', function(){
		const report = htmllint.string('<button type="button"></button>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report when button has type="reset"', function(){
		const report = htmllint.string('<button type="reset"></button>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should report error when type attribute is missing', function(){
		const report = htmllint.string('<button></button>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be button-type").to.equal('button-type');
	});

	it('should report error when type attribute is invalid', function(){
		const report = htmllint.string('<button></button>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be button-type").to.equal('button-type');
	});

	it('smoketest', function(){
		const report = htmllint.file('./test/files/button-type.html');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 2 errors").to.have.lengthOf(2);
		expect(report.results[0].messages[0].ruleId, "reported error should be button-type").to.equal('button-type');
		expect(report.results[0].messages[1].ruleId, "reported error should be button-type").to.equal('button-type');
		expect(report.results[0].messages[0].line, "first error should be on line 2").to.equal(2);
		expect(report.results[0].messages[0].column, "first error should be on column 2").to.equal(2);
		expect(report.results[0].messages[1].line, "second error should be on line 3").to.equal(3);
		expect(report.results[0].messages[1].column, "second error should be on column 2").to.equal(2);
	});

});
