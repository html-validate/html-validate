'use strict';

describe('rule attr-quotes', function(){

	const expect = require('chai').expect;
	const HtmlLint = require('../../src/htmllint');

	let htmllint;

	describe('with double-quote option', function(){

		before(function(){
			htmllint = new HtmlLint({
				rules: {'attr-quotes': ['error', {style: "double"}]},
			});
		});

		it('should not report when attributes use double quotes', function(){
			let report = htmllint.string('<div foo="bar"></div>');
			expect(report.valid, "linting should report success").to.be.true;
			expect(report.results, "report should contain no errors").to.have.lengthOf(0);
		});

		it('should report error when attributes use single quotes', function(){
			let report = htmllint.string('<div foo=\'bar\'></div>');
			expect(report.valid, "linting should report success").to.be.false;
			expect(report.results[0].messages, "report should contain no errors").to.have.lengthOf(1);
			expect(report.results[0].messages[0].rule, "reported error should be attr-quotes").to.equal('attr-quotes');
		});

	});

	describe('with single-quote option', function(){

		before(function(){
			htmllint = new HtmlLint({
				rules: {'attr-quotes': ['error', {style: "single"}]},
			});
		});

		it('should report error when attributes use double quotes', function(){
			let report = htmllint.string('<div foo="bar"></div>');
			expect(report.valid, "linting should report success").to.be.false;
			expect(report.results[0].messages, "report should contain no errors").to.have.lengthOf(1);
			expect(report.results[0].messages[0].rule, "reported error should be attr-quotes").to.equal('attr-quotes');
		});

		it('should not report when attributes use single quotes', function(){
			let report = htmllint.string('<div foo=\'bar\'></div>');
			expect(report.valid, "linting should report success").to.be.true;
			expect(report.results, "report should contain no errors").to.have.lengthOf(0);
		});

	});

});
