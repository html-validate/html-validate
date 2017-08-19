import HtmlLint from '../../src/htmllint';

describe('rule no-trailing-whitespace', function(){

	const expect = require('chai').expect;

	let htmllint: HtmlLint;

	before(function(){
		htmllint = new HtmlLint({
			rules: {'no-trailing-whitespace': 'error'},
		});
	});

	it('should not report when there is no trailing whitespace', function(){
		const report = htmllint.string('<div>\n  foo\n</div>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should report error when tag have trailing whitespace', function(){
		const report = htmllint.string('<p>  \n</p>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be no-trailing-whitespace").to.equal('no-trailing-whitespace');
	});

	it('should report error when empty line have trailing whitespace', function(){
		const report = htmllint.string('<p>\n  \n</p>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be no-trailing-whitespace").to.equal('no-trailing-whitespace');
	});

	it('should report error for both tabs and spaces', function(){
		const report = htmllint.string('<p>\n  \n\t\n</p>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 2 errors").to.have.lengthOf(2);
		expect(report.results[0].messages[0].ruleId, "reported error should be no-trailing-whitespace").to.equal('no-trailing-whitespace');
		expect(report.results[0].messages[1].ruleId, "reported error should be no-trailing-whitespace").to.equal('no-trailing-whitespace');
	});

	it('smoketest', function(){
		const report = htmllint.file('./test/files/trailing-whitespace.html');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 6 errors").to.have.lengthOf(6);
		expect(report.results[0].messages[0].ruleId, "reported error should be no-trailing-whitespace").to.equal('no-trailing-whitespace');
		expect(report.results[0].messages[1].ruleId, "reported error should be no-trailing-whitespace").to.equal('no-trailing-whitespace');
		expect(report.results[0].messages[2].ruleId, "reported error should be no-trailing-whitespace").to.equal('no-trailing-whitespace');
		expect(report.results[0].messages[3].ruleId, "reported error should be no-trailing-whitespace").to.equal('no-trailing-whitespace');
		expect(report.results[0].messages[4].ruleId, "reported error should be no-trailing-whitespace").to.equal('no-trailing-whitespace');
		expect(report.results[0].messages[5].ruleId, "reported error should be no-trailing-whitespace").to.equal('no-trailing-whitespace');
		expect(report.results[0].messages[0].line, "first error should be on line 5").to.equal(5);
		expect(report.results[0].messages[0].column, "first error should be on column 6").to.equal(6);
		expect(report.results[0].messages[1].line, "second error should be on line 6").to.equal(6);
		expect(report.results[0].messages[1].column, "second error should be on column 6").to.equal(6);
		expect(report.results[0].messages[2].line, "third error should be on line 7").to.equal(7);
		expect(report.results[0].messages[2].column, "third error should be on column 1").to.equal(1);
		expect(report.results[0].messages[3].line, "forth error should be on line 8").to.equal(8);
		expect(report.results[0].messages[3].column, "forth error should be on column 6").to.equal(6);
		expect(report.results[0].messages[4].line, "fifth error should be on line 12").to.equal(12);
		expect(report.results[0].messages[4].column, "fifth error should be on column 7").to.equal(7);
		expect(report.results[0].messages[5].line, "sixth error should be on line 15").to.equal(15);
		expect(report.results[0].messages[5].column, "sixth error should be on column 1").to.equal(1);
	});

});
