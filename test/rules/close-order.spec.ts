'use strict';

import HtmlLint from '../../src/htmllint';

describe('rule close-order', function(){

	const expect = require('chai').expect;

	let htmllint;

	before(function(){
		htmllint = new HtmlLint({
			rules: {'close-order': 'error'},
		});
	});

	it('should not report when elements are correct in wrong order', function(){
		let report = htmllint.string('<div></div>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report for self-closing element', function(){
		let report = htmllint.string('<div><input/></div>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report for self-closing element with attribute', function(){
		let report = htmllint.string('<div><input required/></div>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report for void element', function(){
		let report = htmllint.string('<div><input></div>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report for void element with attribute', function(){
		let report = htmllint.string('<div><input required></div>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should report error when elements are closed in wrong order', function(){
		let report = htmllint.string('<div></p>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].rule, "reported error should be close-order").to.equal('close-order');
	});

	it('should report error when element is missing close tag', function(){
		let report = htmllint.string('<div>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].rule, "reported error should be close-order").to.equal('close-order');
	});

	it('should report error when element is missing opening tag', function(){
		let report = htmllint.string('</div>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].rule, "reported error should be close-order").to.equal('close-order');
	});

});
