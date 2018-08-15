import HtmlValidate from '../htmlvalidate';

describe('rule no-dup-attr', function() {
	let htmlvalidate: HtmlValidate;

	beforeAll(function() {
		htmlvalidate = new HtmlValidate({
			rules: { 'no-dup-attr': 'error' },
		});
	});

	it('should not report when no attribute is duplicated', function() {
		const report = htmlvalidate.validateString('<p foo="bar"></p>');
		expect(report).toBeValid();
	});

	it('should report when attribute is duplicated', function() {
		const report = htmlvalidate.validateString('<p foo="bar" foo="baz"></p></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('no-dup-attr', 'Attribute "foo" duplicated');
	});

	it('should report when attribute is duplicated case insensitive', function() {
		const report = htmlvalidate.validateString('<p foo="bar" FOO="baz"></p></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('no-dup-attr', 'Attribute "foo" duplicated');
	});

});
