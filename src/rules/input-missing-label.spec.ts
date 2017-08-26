import HtmlLint from '../htmllint';

describe('rule input-missing-label', function() {

	const expect = require('chai').expect;

	let htmllint: HtmlLint;

	before(function() {
		htmllint = new HtmlLint({
			rules: { 'input-missing-label': 'error' },
		});
	});

	it('should not report when input id has matching label', function() {
		const report = htmllint.string('<label for="foo">foo</label><input id="foo"/>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report when input is nested inside label', function() {
		const report = htmllint.string('<label>foo <input/></label>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should report when label is missing label', function() {
		const report = htmllint.string('<input/>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be indent").to.equal('input-missing-label');
		expect(report.results[0].messages[0].message).to.equal('Input element does not have a label');
	});

	it('smoketest', function(){
		const report = htmllint.file('./test-files/rules/input-missing-label.html');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 errors").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be input-missing-label").to.equal('input-missing-label');
		expect(report.results[0].messages[0].line, "first error should be on line 11").to.equal(11);
		expect(report.results[0].messages[0].column, "first error should be on column 2").to.equal(2);
	});

});
