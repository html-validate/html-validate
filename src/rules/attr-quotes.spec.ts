import HtmlValidate from '../htmlvalidate';

describe('rule attr-quotes', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	describe('with double-quote option', function(){

		before(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'attr-quotes': ['error', {style: "double"}]},
			});
		});

		it('should not report when attributes use double quotes', function(){
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).to.be.valid;
		});

		it('should report error when attributes use single quotes', function(){
			const report = htmlvalidate.validateString('<div foo=\'bar\'></div>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('attr-quotes', 'Attribute "foo" used \' instead of expected "');
		});

	});

	describe('with single-quote option', function(){

		before(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'attr-quotes': ['error', {style: "single"}]},
			});
		});

		it('should report error when attributes use double quotes', function(){
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('attr-quotes', 'Attribute "foo" used " instead of expected \'');
		});

		it('should not report when attributes use single quotes', function(){
			const report = htmlvalidate.validateString('<div foo=\'bar\'></div>');
			expect(report).to.be.valid;
		});

	});

	describe('with unquoted allowed', function(){

		before(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'attr-quotes': ['error', {style: "double", unquoted: true}]},
			});
		});

		it('should not report when attributes is using quotes', function(){
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).to.be.valid;
		});

		it('should not report error when attribute value is unquoted', function(){
			const report = htmlvalidate.validateString('<div foo=5></div>');
			expect(report).to.be.valid;
		});

	});

	describe('with unquoted disabled', function(){

		before(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'attr-quotes': ['error', {style: "double", unquoted: false}]},
			});
		});

		it('should not report when attributes is using quotes', function(){
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).to.be.valid;
		});

		it('should report error when attribute value is unquoted', function(){
			const report = htmlvalidate.validateString('<div foo=5></div>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('attr-quotes', 'Attribute "foo" using unquoted value');
		});

	});

});
