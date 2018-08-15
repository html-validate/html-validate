import HtmlValidate from '../htmlvalidate';

describe('rule no-dup-id', function() {
	let htmlvalidate: HtmlValidate;

	beforeAll(function() {
		htmlvalidate = new HtmlValidate({
			rules: { 'no-dup-id': 'error' },
		});
	});

	it('should not report when no id is duplicated', function() {
		const report = htmlvalidate.validateString('<p id="foo"></p><p id="bar"></p>');
		expect(report).toBeValid();
	});

	it('should report when id is duplicated', function() {
		const report = htmlvalidate.validateString('<p id="foo"></p><p id="foo"></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('no-dup-id', 'Duplicate ID "foo"');
	});

});
