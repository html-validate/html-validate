import HtmlLint from '../../src/htmllint';

describe('rule attr-quotes', function(){

	const expect = require('chai').expect;

	let htmllint: HtmlLint;

	describe('with double-quote option', function(){

		before(function(){
			htmllint = new HtmlLint({
				rules: {'attr-quotes': ['error', {style: "double"}]},
			});
		});

		it('should not report when attributes use double quotes', function(){
			const report = htmllint.string('<div foo="bar"></div>');
			expect(report.valid, "linting should report success").to.be.true;
			expect(report.results, "report should contain no errors").to.have.lengthOf(0);
		});

		it('should report error when attributes use single quotes', function(){
			const report = htmllint.string('<div foo=\'bar\'></div>');
			expect(report.valid, "linting should report success").to.be.false;
			expect(report.results[0].messages, "report should contain no errors").to.have.lengthOf(1);
			expect(report.results[0].messages[0].ruleId, "reported error should be attr-quotes").to.equal('attr-quotes');
		});

	});

	describe('with single-quote option', function(){

		before(function(){
			htmllint = new HtmlLint({
				rules: {'attr-quotes': ['error', {style: "single"}]},
			});
		});

		it('should report error when attributes use double quotes', function(){
			const report = htmllint.string('<div foo="bar"></div>');
			expect(report.valid, "linting should report success").to.be.false;
			expect(report.results[0].messages, "report should contain no errors").to.have.lengthOf(1);
			expect(report.results[0].messages[0].ruleId, "reported error should be attr-quotes").to.equal('attr-quotes');
		});

		it('should not report when attributes use single quotes', function(){
			const report = htmllint.string('<div foo=\'bar\'></div>');
			expect(report.valid, "linting should report success").to.be.true;
			expect(report.results, "report should contain no errors").to.have.lengthOf(0);
		});

	});

	describe('with unquoted allowed', function(){

		before(function(){
			htmllint = new HtmlLint({
				rules: {'attr-quotes': ['error', {style: "double", unquoted: true}]},
			});
		});

		it('should not report when attributes is using quotes', function(){
			const report = htmllint.string('<div foo="bar"></div>');
			expect(report.valid, "linting should report success").to.be.true;
			expect(report.results, "report should contain no errors").to.have.lengthOf(0);
		});

		it('should not report error when attribute value is unquoted', function(){
			const report = htmllint.string('<div foo=5></div>');
			expect(report.valid, "linting should report success").to.be.true;
			expect(report.results, "report should contain no errors").to.have.lengthOf(0);
		});

	});

	describe('with unquoted disabled', function(){

		before(function(){
			htmllint = new HtmlLint({
				rules: {'attr-quotes': ['error', {style: "double", unquoted: false}]},
			});
		});

		it('should not report when attributes is using quotes', function(){
			const report = htmllint.string('<div foo="bar"></div>');
			expect(report.valid, "linting should report success").to.be.true;
			expect(report.results, "report should contain no errors").to.have.lengthOf(0);
		});

		it('should report error when attribute value is unquoted', function(){
			const report = htmllint.string('<div foo=5></div>');
			expect(report.valid, "linting should report success").to.be.false;
			expect(report.results[0].messages, "report should contain no errors").to.have.lengthOf(1);
			expect(report.results[0].messages[0].ruleId, "reported error should be attr-quotes").to.equal('attr-quotes');
		});

	});

});
