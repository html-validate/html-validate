import HtmlValidate from '../htmlvalidate';

describe('rule input-missing-label', function() {
	let htmlvalidate: HtmlValidate;

	beforeAll(function() {
		htmlvalidate = new HtmlValidate({
			rules: { 'input-missing-label': 'error' },
		});
	});

	it('should not report when input id has matching label', function() {
		const report = htmlvalidate.validateString('<label for="foo">foo</label><input id="foo"/>');
		expect(report).toBeValid();
	});

	it('should not report when input is nested inside label', function() {
		const report = htmlvalidate.validateString('<label>foo <input/></label>');
		expect(report).toBeValid();
	});

	it('should report when label is missing label', function() {
		const report = htmlvalidate.validateString('<input/>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('input-missing-label', 'Input element does not have a label');
	});

});
