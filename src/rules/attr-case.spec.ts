import HtmlValidate from '../htmlvalidate';

describe('rule attr-case', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	describe('configured with "lowercase"', function(){

		before(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'attr-case': ['error', {style: "lowercase"}]},
			});
		});

		it('should not report error when attributes is lowercase', function(){
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).to.be.valid;
		});

		it('should not report error when attribute has special characters', function(){
			const report = htmlvalidate.validateString('<div foo-bar-9="bar"></div>');
			expect(report).to.be.valid;
		});

		it('should report error when attributes is uppercase', function(){
			const report = htmlvalidate.validateString('<div FOO="bar"></div>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('attr-case', 'Attribute "FOO" should be lowercase');
		});

		it('should report error when attributes is mixed', function(){
			const report = htmlvalidate.validateString('<div clAss="bar"></div>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('attr-case', 'Attribute "clAss" should be lowercase');
		});

	});

	describe('configured with "uppercase"', function(){

		before(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'attr-case': ['error', {style: "uppercase"}]},
			});
		});

		it('should report error when attributes is lowercase', function(){
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('attr-case', 'Attribute "foo" should be uppercase');
		});

		it('should not report error when attribute has special characters', function(){
			const report = htmlvalidate.validateString('<div FOO-BAR-9="bar"></div>');
			expect(report).to.be.valid;
		});

		it('should not report error when attributes is uppercase', function(){
			const report = htmlvalidate.validateString('<div FOO="bar"></div>');
			expect(report).to.be.valid;
		});

		it('should report error when attributes is mixed', function(){
			const report = htmlvalidate.validateString('<div clAss="bar"></div>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('attr-case', 'Attribute "clAss" should be uppercase');
		});

	});

});
