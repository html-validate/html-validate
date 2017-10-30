import HtmlValidate from '../htmlvalidate';

describe('rule deprecated', function() {

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function() {
		htmlvalidate = new HtmlValidate({
			rules: { 'deprecated': 'error' },
		});
	});

	it('should not report when regular element is used', function() {
		const report = htmlvalidate.validateString('<p></p>');
		expect(report).to.be.valid;
	});

	it('should report error when deprecated element is used', function() {
		const report = htmlvalidate.validateString('<marquee>foobar</marquee>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('deprecated', '<marquee> is deprecated');
	});

});
