import HtmlValidate from '../htmlvalidate';

describe('rule attr-quotes', function(){
	let htmlvalidate: HtmlValidate;

	describe('with double-quote option', function(){

		beforeAll(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'attr-quotes': ['error', {style: "double"}]},
			});
		});

		it('should not report when attributes use double quotes', function(){
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it('should report error when attributes use single quotes', function(){
			const report = htmlvalidate.validateString('<div foo=\'bar\'></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('attr-quotes', 'Attribute "foo" used \' instead of expected "');
		});

	});

	describe('with single-quote option', function(){

		beforeAll(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'attr-quotes': ['error', {style: "single"}]},
			});
		});

		it('should report error when attributes use double quotes', function(){
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('attr-quotes', 'Attribute "foo" used " instead of expected \'');
		});

		it('should not report when attributes use single quotes', function(){
			const report = htmlvalidate.validateString('<div foo=\'bar\'></div>');
			expect(report).toBeValid();
		});

	});

	describe('with unquoted allowed', function(){

		beforeAll(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'attr-quotes': ['error', {style: "double", unquoted: true}]},
			});
		});

		it('should not report when attributes is using quotes', function(){
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it('should not report error when attribute value is unquoted', function(){
			const report = htmlvalidate.validateString('<div foo=5></div>');
			expect(report).toBeValid();
		});

	});

	describe('with unquoted disabled', function(){

		beforeAll(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'attr-quotes': ['error', {style: "double", unquoted: false}]},
			});
		});

		it('should not report when attributes is using quotes', function(){
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it('should report error when attribute value is unquoted', function(){
			const report = htmlvalidate.validateString('<div foo=5></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('attr-quotes', 'Attribute "foo" using unquoted value');
		});

	});

});
