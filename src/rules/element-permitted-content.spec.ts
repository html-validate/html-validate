import HtmlValidate from '../htmlvalidate';

describe('rule element-permitted-content', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'element-permitted-content': 'error'},
		});
	});

	it('should report error when @flow is child of @phrasing', function(){
		const report = htmlvalidate.string('<span><div></div></span>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be element-permitted-content").to.equal('element-permitted-content');
	});

	it('should not report error when phrasing a-element is child of @phrasing', function(){
		const report = htmlvalidate.string('<span><a><span></span></a></span>');
		expect(report.valid, "linting should report failure").to.be.true;
	});

	it('should report error when non-phrasing a-element is child of @phrasing', function(){
		const report = htmlvalidate.string('<span><a><div></div></a></span>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be element-permitted-content").to.equal('element-permitted-content');
	});

	it('should report error when label contains non-phrasing', function(){
		const report = htmlvalidate.string('<label><div>foobar</div></label>');
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.results[0].messages, "report should contain 1 error").to.have.lengthOf(1);
		expect(report.results[0].messages[0].ruleId, "reported error should be element-permitted-content").to.equal('element-permitted-content');
	});

	it('should handle missing meta entry', function(){
		const report = htmlvalidate.string('<p><foo>foo</foo></p>');
		expect(report.valid, "linting should report success").to.be.true;
	});

});
