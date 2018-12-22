import HtmlValidate from '../htmlvalidate';
import '../matchers';

describe('rule attr-quotes', () => {
	let htmlvalidate: HtmlValidate;

	describe('with double-quote option', () => {

		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: {'attr-quotes': ['error', {style: "double"}]},
			});
		});

		it('should not report when attributes use double quotes', () => {
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it('should not report for boolean attribute', () => {
			const report = htmlvalidate.validateString('<input checked>');
			expect(report).toBeValid();
		});

		it('should report error when attributes use single quotes', () => {
			const report = htmlvalidate.validateString('<div foo=\'bar\'></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('attr-quotes', 'Attribute "foo" used \' instead of expected "');
		});

	});

	describe('with single-quote option', () => {

		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: {'attr-quotes': ['error', {style: "single"}]},
			});
		});

		it('should report error when attributes use double quotes', () => {
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('attr-quotes', 'Attribute "foo" used " instead of expected \'');
		});

		it('should not report when attributes use single quotes', () => {
			const report = htmlvalidate.validateString('<div foo=\'bar\'></div>');
			expect(report).toBeValid();
		});

	});

	describe('with unquoted allowed', () => {

		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: {'attr-quotes': ['error', {style: "double", unquoted: true}]},
			});
		});

		it('should not report when attributes is using quotes', () => {
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it('should not report error when attribute value is unquoted', () => {
			const report = htmlvalidate.validateString('<div foo=5></div>');
			expect(report).toBeValid();
		});

	});

	describe('with unquoted disabled', () => {

		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: {'attr-quotes': ['error', {style: "double", unquoted: false}]},
			});
		});

		it('should not report when attributes is using quotes', () => {
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it('should report error when attribute value is unquoted', () => {
			const report = htmlvalidate.validateString('<div foo=5></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('attr-quotes', 'Attribute "foo" using unquoted value');
		});

	});

	it('should default to double quotes for invalid style', () => {
		htmlvalidate = new HtmlValidate({
			rules: {'attr-quotes': ['error', {style: "foobar"}]},
		});
		const report = htmlvalidate.validateString("<div foo='bar'></div>");
		expect(report).toBeInvalid();
		expect(report).toHaveError('attr-quotes', `Attribute "foo" used ' instead of expected "`);
	});

});
