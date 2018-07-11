import HtmlValidate from '../htmlvalidate';

describe('rule element-case', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	describe('configured with "lowercase"', function(){

		before(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'element-case': ['error', {style: "lowercase"}]},
			});
		});

		it('should not report error when element is lowercase', function(){
			const report = htmlvalidate.validateString('<foo></foo>');
			expect(report).to.be.valid;
		});

		it('should not report error when element has special characters', function(){
			const report = htmlvalidate.validateString('<foo-bar-9></foo-bar-9>');
			expect(report).to.be.valid;
		});

		it('should report error when element is uppercase', function(){
			const report = htmlvalidate.validateString('<FOO></FOO>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('element-case', 'Element "FOO" should be lowercase');
		});

		it('should report error when element is mixed', function(){
			const report = htmlvalidate.validateString('<fOo></fOo>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('element-case', 'Element "fOo" should be lowercase');
		});

	});

	describe('configured with "uppercase"', function(){

		before(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'element-case': ['error', {style: "uppercase"}]},
			});
		});

		it('should report error when element is lowercase', function(){
			const report = htmlvalidate.validateString('<foo></foo>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('element-case', 'Element "foo" should be uppercase');
		});

		it('should not report error when element has special characters', function(){
			const report = htmlvalidate.validateString('<FOO-BAR-9></FOO-BAR-9>');
			expect(report).to.be.valid;
		});

		it('should not report error when element is uppercase', function(){
			const report = htmlvalidate.validateString('<FOO></FOO>');
			expect(report).to.be.valid;
		});

		it('should report error when element is mixed', function(){
			const report = htmlvalidate.validateString('<fOo></fOo>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('element-case', 'Element "fOo" should be uppercase');
		});

	});

});
