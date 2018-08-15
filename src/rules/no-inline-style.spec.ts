import HtmlValidate from '../htmlvalidate';

describe('rule no-inline-style', function(){
	let htmlvalidate: HtmlValidate;

	beforeAll(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'no-inline-style': 'error'},
		});
	});

	it('should report when style attribute is used', function(){
		const report = htmlvalidate.validateString('<p style=""></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('no-inline-style', 'Inline style is not allowed');
	});

});
