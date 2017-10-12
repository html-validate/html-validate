import HtmlValidate from '../htmlvalidate';

describe('rule no-dup-attr', function() {

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function() {
		htmlvalidate = new HtmlValidate({
			rules: { 'no-dup-attr': 'error' },
		});
	});

	it('should not report when no attribute is duplicated', function() {
		const report = htmlvalidate.string('<p foo="bar"></p>');
		expect(report).to.be.valid;
	});

	it('should report when attribute is duplicated', function() {
		const report = htmlvalidate.string('<p foo="bar" foo="baz"></p></p>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('no-dup-attr', 'Attribute "foo" duplicated');
	});

	it('should report when attribute is duplicated case insensitive', function() {
		const report = htmlvalidate.string('<p foo="bar" FOO="baz"></p></p>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('no-dup-attr', 'Attribute "foo" duplicated');
	});

});
