import HtmlLint from '../htmllint';

describe('missing rule', function(){

	const expect = require('chai').expect;

	let htmllint: HtmlLint;

	before(function(){
		htmllint = new HtmlLint({
			rules: {'foo': 'error'},
		});
	});

	it('should report error when rule is not defined', function(){
		const report = htmllint.string('<p></p>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be missing definition for rule").to.equal('foo');
	});

});
