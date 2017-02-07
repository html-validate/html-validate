import HtmlLint from '../../src/htmllint';

describe('rule close-attr', function(){

	const expect = require('chai').expect;

	let htmllint;

	before(function(){
		htmllint = new HtmlLint({
			rules: {'close-attr': 'error'},
		});
	});

	it('should not report when close tags are correct', function(){
		let report = htmllint.string('<div></div>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report errors on self-closing tags', function(){
		let report = htmllint.string('<input required/>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report errors on void tags', function(){
		let report = htmllint.string('<input required>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should report when close tags contains attributes', function(){
		let html = "<p></p foo=\"bar\"><p></p foo='bar'><p></p foo>";
		let report = htmllint.string(html);
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 3 errors").to.have.lengthOf(3);
		expect(report.results[0].messages[0].ruleId, "reported error should be close-attr").to.equal('close-attr');
		expect(report.results[0].messages[1].ruleId, "reported error should be close-attr").to.equal('close-attr');
		expect(report.results[0].messages[2].ruleId, "reported error should be close-attr").to.equal('close-attr');
	});

});
