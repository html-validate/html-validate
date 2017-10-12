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
		expect(report).to.be.invalid;
		expect(report).to.have.error('element-permitted-content', 'Element <div> is not permitted as content in <span>');
	});

	it('should not report error when phrasing a-element is child of @phrasing', function(){
		const report = htmlvalidate.string('<span><a><span></span></a></span>');
		expect(report).to.be.valid;
	});

	it('should report error when non-phrasing a-element is child of @phrasing', function(){
		const report = htmlvalidate.string('<span><a><div></div></a></span>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('element-permitted-content', 'Element <div> is not permitted as content in <span>');
	});

	it('should report error when label contains non-phrasing', function(){
		const report = htmlvalidate.string('<label><div>foobar</div></label>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('element-permitted-content', 'Element <div> is not permitted as content in <label>');
	});

	it('should handle missing meta entry (child)', function(){
		const report = htmlvalidate.string('<p><foo>foo</foo></p>');
		expect(report).to.be.valid;
	});

	it('should handle missing meta entry (descendant)', function(){
		const report = htmlvalidate.string('<th><foo>foo</foo></th>');
		expect(report).to.be.valid;
	});

});
