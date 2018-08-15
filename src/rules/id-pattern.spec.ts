import HtmlValidate from '../htmlvalidate';

describe('rule id-pattern', function(){
	let htmlvalidate: HtmlValidate;

	beforeAll(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'id-pattern': 'error'},
		});
	});

	it('should not report error when id follows pattern', function(){
		const report = htmlvalidate.validateString('<p id="foo-bar"></p>');
		expect(report).toBeValid();
	});

	it('should report error when id does not follow pattern', function(){
		const report = htmlvalidate.validateString('<p id="fooBar"></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('id-pattern', expect.stringMatching(/ID "fooBar" does not match required pattern ".*"/));
	});

});
