import HtmlValidate from '../htmlvalidate';

describe('rule close-attr', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'close-attr': 'error'},
		});
	});

	it('should not report when close tags are correct', function(){
		const report = htmlvalidate.validateString('<div></div>');
		expect(report).to.be.valid;
	});

	it('should not report errors on self-closing tags', function(){
		const report = htmlvalidate.validateString('<input required/>');
		expect(report).to.be.valid;
	});

	it('should not report errors on void tags', function(){
		const report = htmlvalidate.validateString('<input required>');
		expect(report).to.be.valid;
	});

	it('should report when close tags contains attributes', function(){
		const html = "<p></p foo=\"bar\"><p></p foo='bar'><p></p foo>";
		const report = htmlvalidate.validateString(html);
		expect(report).to.be.invalid;
		expect(report.results[0].messages, "report should contain 3 errors").to.have.lengthOf(3);
		expect(report.results[0].messages[0].ruleId, "reported error should be close-attr").to.equal('close-attr');
		expect(report.results[0].messages[1].ruleId, "reported error should be close-attr").to.equal('close-attr');
		expect(report.results[0].messages[2].ruleId, "reported error should be close-attr").to.equal('close-attr');
	});

});
