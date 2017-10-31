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
		const report = htmlvalidate.validateString('<div>\n  foo\n</div>');
		expect(report).to.be.valid;
	});

	it('should report error when tag have trailing whitespace', function(){
		const report = htmlvalidate.validateString('<p>  \n</p>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('no-trailing-whitespace', 'Trailing whitespace');
	});

	it('should report error when empty line have trailing whitespace', function(){
		const report = htmlvalidate.validateString('<p>\n  \n</p>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('no-trailing-whitespace', 'Trailing whitespace');
	});

	it('should report error for both tabs and spaces', function(){
		const report = htmlvalidate.validateString('<p>\n  \n\t\n</p>');
		expect(report).to.be.invalid;
		expect(report.results[0].messages, "report should contain 2 errors").to.have.lengthOf(2);
		expect(report.results[0].messages[0].ruleId, "reported error should be no-trailing-whitespace").to.equal('no-trailing-whitespace');
		expect(report.results[0].messages[1].ruleId, "reported error should be no-trailing-whitespace").to.equal('no-trailing-whitespace');
	});

});
