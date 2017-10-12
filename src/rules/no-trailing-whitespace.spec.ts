import HtmlValidate from '../htmlvalidate';

describe('rule no-trailing-whitespace', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'no-trailing-whitespace': 'error'},
		});
	});

	it('should not report when there is no trailing whitespace', function(){
		const report = htmlvalidate.string('<div>\n  foo\n</div>');
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.results, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should report error when tag have trailing whitespace', function(){
		const report = htmlvalidate.string('<p>  \n</p>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be no-trailing-whitespace").to.equal('no-trailing-whitespace');
	});

	it('should report error when empty line have trailing whitespace', function(){
		const report = htmlvalidate.string('<p>\n  \n</p>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be no-trailing-whitespace").to.equal('no-trailing-whitespace');
	});

	it('should report error for both tabs and spaces', function(){
		const report = htmlvalidate.string('<p>\n  \n\t\n</p>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 2 errors").to.have.lengthOf(2);
		expect(report.results[0].messages[0].ruleId, "reported error should be no-trailing-whitespace").to.equal('no-trailing-whitespace');
		expect(report.results[0].messages[1].ruleId, "reported error should be no-trailing-whitespace").to.equal('no-trailing-whitespace');
	});

});
