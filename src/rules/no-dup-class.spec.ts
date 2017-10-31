import HtmlValidate from '../htmlvalidate';

describe('rule no-dup-class', function() {

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function() {
		htmlvalidate = new HtmlValidate({
			rules: { 'no-dup-class': 'error' },
		});
	});

	it('should not report when class is missing', function() {
		const report = htmlvalidate.validateString('<p></p>');
		expect(report).to.be.valid;
	});

	it('should not report when class has no duplicates', function() {
		const report = htmlvalidate.validateString('<p class="foo bar"></p>');
		expect(report).to.be.valid;
	});

	it('should report when when class has duplicates', function() {
		const report = htmlvalidate.validateString('<p class="foo bar foo"></p></p>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('no-dup-class', 'Class "foo" duplicated');
	});

});
