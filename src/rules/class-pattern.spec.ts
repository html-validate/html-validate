import HtmlValidate from '../htmlvalidate';

describe('rule class-pattern', function(){
	let htmlvalidate: HtmlValidate;

	beforeAll(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'class-pattern': 'error'},
		});
	});

	it('should not report error when class follows pattern', function(){
		const report = htmlvalidate.validateString('<p class="foo-bar"></p>');
		expect(report).toBeValid();
	});

	it('should report error when class does not follow pattern', function(){
		const report = htmlvalidate.validateString('<p class="foo-bar fooBar spam"></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('class-pattern', expect.stringMatching(/Class "fooBar" does not match required pattern ".*"/));
	});

});
