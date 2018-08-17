import HtmlValidate from '../htmlvalidate';

describe('rule element-permitted-content', function(){
	let htmlvalidate: HtmlValidate;

	beforeAll(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'element-permitted-content': 'error'},
		});
	});

	it('should report error when @flow is child of @phrasing', function(){
		const report = htmlvalidate.validateString('<span><div></div></span>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('element-permitted-content', 'Element <div> is not permitted as content in <span>');
	});

	it('should not report error when phrasing a-element is child of @phrasing', function(){
		const report = htmlvalidate.validateString('<span><a><span></span></a></span>');
		expect(report).toBeValid();
	});

	it('should report error when non-phrasing a-element is child of @phrasing', function(){
		const report = htmlvalidate.validateString('<span><a><div></div></a></span>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('element-permitted-content', 'Element <div> is not permitted as content in <span>');
	});

	it('should report error when label contains non-phrasing', function(){
		const report = htmlvalidate.validateString('<label><div>foobar</div></label>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('element-permitted-content', 'Element <div> is not permitted as content in <label>');
	});

	it('should handle missing meta entry (child)', function(){
		const report = htmlvalidate.validateString('<p><foo>foo</foo></p>');
		expect(report).toBeValid();
	});

	it('should handle missing meta entry (descendant)', function(){
		const report = htmlvalidate.validateString('<th><foo>foo</foo></th>');
		expect(report).toBeValid();
	});

});
