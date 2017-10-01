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
		const report = htmlvalidate.string('<p></p>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should report error when deprecated element is used', function() {
		const report = htmlvalidate.string('<marquee>foobar</marquee>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be indent").to.equal('deprecated');
		expect(report.results[0].messages[0].message).to.equal('<marquee> is deprecated');
	});

});
