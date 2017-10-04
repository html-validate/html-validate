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
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should report when id is duplicated', function() {
		const report = htmlvalidate.string('<p id="foo"></p><p id="foo"></p>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be no-dup-id").to.equal('no-dup-id');
		expect(report.results[0].messages[0].message).to.equal('Duplicate ID "foo"');
	});

});
