import HtmlValidate from '../htmlvalidate';

describe('rule void', function() {

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function() {
		htmlvalidate = new HtmlValidate({
			rules: { 'void': 'error' },
		});
	});

	it('should not report when void element omitted end tag', function() {
		const report = htmlvalidate.string('<input/>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report when non-void element has end tag', function() {
		const report = htmlvalidate.string('<div></div>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should not report when xml namespaces is used', function() {
		const report = htmlvalidate.string('<xi:include/>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should report error when non-void element omitted end tag', function(){
		const report = htmlvalidate.string('<div/>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be indent").to.equal('void');
		expect(report.results[0].messages[0].message).to.equal('End tag for <div> must not be omitted');
	});

});
