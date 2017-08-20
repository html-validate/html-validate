import HtmlLint from '../../src/htmllint';

describe('rule no-dup-attr', function() {

	const expect = require('chai').expect;

	let htmllint: HtmlLint;

	before(function() {
		htmllint = new HtmlLint({
			rules: { 'no-dup-attr': 'error' },
		});
	});

	it('should not report when no attribute is duplicated', function() {
		const report = htmllint.string('<p foo="bar"></p>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should report when attribute is duplicated', function() {
		const report = htmllint.string('<p foo="bar" foo="baz"></p></p>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be indent").to.equal('no-dup-attr');
		expect(report.results[0].messages[0].message).to.equal('Attribute "foo" duplicated');
	});

	it('smoketest', function(){
		const report = htmllint.file('./test/files/duplicated-attr.html');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 errors").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be no-dup-attr").to.equal('no-dup-attr');
		expect(report.results[0].messages[0].line, "first error should be on line 2").to.equal(2);
		expect(report.results[0].messages[0].column, "first error should be on column 26").to.equal(26);
	});

});
