import HtmlValidate from '../htmlvalidate';

describe('rule no-dup-id', function() {

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function() {
		htmlvalidate = new HtmlValidate({
			rules: { 'no-dup-id': 'error' },
		});
	});

	it('should not report when no id is duplicated', function() {
		const report = htmlvalidate.string('<p id="foo"></p><p id="bar"></p>');
		expect(report).to.be.valid;
	});

	it('should report when id is duplicated', function() {
		const report = htmlvalidate.string('<p id="foo"></p><p id="foo"></p>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('no-dup-id', 'Duplicate ID "foo"');
	});

});
