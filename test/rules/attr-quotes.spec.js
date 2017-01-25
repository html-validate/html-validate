'use strict';

var expect = require('chai').expect;
var HtmlLint = require('../../src/htmllint');

describe('rule attr-quotes', function(){
	var htmllint;

	describe('with double-quote option', function(){

		before(function(){
			htmllint = new HtmlLint({
				rules: {'attr-quotes': ['error', {style: "double"}]},
			});
		});

		it('should not report when attributes use double quotes', function(){
			var report = {};
			expect(htmllint.string('<div foo="bar"></div>', report), "should parse valid html").to.be.true;
			expect(report.valid, "linting should report success").to.be.true;
			expect(report.error, "report should contain no errors").to.have.lengthOf(0);
		});

		it('should report error when attributes use single quotes', function(){
			var report = {};
			expect(htmllint.string('<div foo=\'bar\'></div>', report), "should parse valid html").to.be.true;
			expect(report.valid, "linting should report success").to.be.false;
			expect(report.error, "report should contain no errors").to.have.lengthOf(1);
			expect(report.error[0].rule, "reported error should be attr-quotes").to.equal('attr-quotes');
		});

	});

	describe('with single-quote option', function(){

		before(function(){
			htmllint = new HtmlLint({
				rules: {'attr-quotes': ['error', {style: "single"}]},
			});
		});

		it('should report error when attributes use double quotes', function(){
			var report = {};
			expect(htmllint.string('<div foo="bar"></div>', report), "should parse valid html").to.be.true;
			expect(report.valid, "linting should report success").to.be.false;
			expect(report.error, "report should contain no errors").to.have.lengthOf(1);
			expect(report.error[0].rule, "reported error should be attr-quotes").to.equal('attr-quotes');
		});

		it('should not report when attributes use single quotes', function(){
			var report = {};
			expect(htmllint.string('<div foo=\'bar\'></div>', report), "should parse valid html").to.be.true;
			expect(report.valid, "linting should report success").to.be.true;
			expect(report.error, "report should contain no errors").to.have.lengthOf(0);
		});

	});

});
