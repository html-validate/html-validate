import HtmlValidate from '../htmlvalidate';

describe('rule no-deprecated-attr', function() {

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function() {
		htmlvalidate = new HtmlValidate({
			rules: { 'no-deprecated-attr': 'error' },
		});
	});

	it('should not report when regular element is used', function() {
		const report = htmlvalidate.string('<body style="background: red;"></body>');
		expect(report).to.be.valid;
	});

	it('should not report when regular element is missing meta', function() {
		const report = htmlvalidate.string('<any style="background: red;"></any>');
		expect(report).to.be.valid;
	});

	it('should not report when regular element has no deprecated attributes', function() {
		const report = htmlvalidate.string('<abbr style="background: red;"></abbr>');
		expect(report).to.be.valid;
	});

	it('should report error when deprecated attribute is used', function() {
		const report = htmlvalidate.string('<body bgcolor="red"></body>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('no-deprecated-attr', 'Attribute "bgcolor" is deprecated on <body> element');
	});

	it('should report error when deprecated attribute is used in any case', function() {
		const report = htmlvalidate.string('<body BGCOLOR="red"></body>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('no-deprecated-attr', 'Attribute "BGCOLOR" is deprecated on <body> element');
	});

});
