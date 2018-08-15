import HtmlValidate from '../htmlvalidate';

describe('rule no-deprecated-attr', function() {
	let htmlvalidate: HtmlValidate;

	beforeAll(function() {
		htmlvalidate = new HtmlValidate({
			rules: { 'no-deprecated-attr': 'error' },
		});
	});

	it('should not report when regular element is used', function() {
		const report = htmlvalidate.validateString('<body style="background: red;"></body>');
		expect(report).toBeValid();
	});

	it('should not report when regular element is missing meta', function() {
		const report = htmlvalidate.validateString('<any style="background: red;"></any>');
		expect(report).toBeValid();
	});

	it('should not report when regular element has no deprecated attributes', function() {
		const report = htmlvalidate.validateString('<abbr style="background: red;"></abbr>');
		expect(report).toBeValid();
	});

	it('should report error when deprecated attribute is used', function() {
		const report = htmlvalidate.validateString('<body bgcolor="red"></body>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('no-deprecated-attr', 'Attribute "bgcolor" is deprecated on <body> element');
	});

	it('should report error when deprecated attribute is used in any case', function() {
		const report = htmlvalidate.validateString('<body BGCOLOR="red"></body>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('no-deprecated-attr', 'Attribute "BGCOLOR" is deprecated on <body> element');
	});

});
