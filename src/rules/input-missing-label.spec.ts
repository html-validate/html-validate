import HtmlValidate from '../htmlvalidate';

describe('rule input-missing-label', function() {

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function() {
		htmlvalidate = new HtmlValidate({
			rules: { 'input-missing-label': 'error' },
		});
	});

	it('should not report when input id has matching label', function() {
		const report = htmlvalidate.string('<label for="foo">foo</label><input id="foo"/>');
		expect(report).to.be.valid;
	});

	it('should not report when input is nested inside label', function() {
		const report = htmlvalidate.string('<label>foo <input/></label>');
		expect(report).to.be.valid;
	});

	it('should report when label is missing label', function() {
		const report = htmlvalidate.string('<input/>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('input-missing-label', 'Input element does not have a label');
	});

});
