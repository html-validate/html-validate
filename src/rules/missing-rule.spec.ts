import HtmlValidate from '../htmlvalidate';

describe('missing rule', function(){
	let htmlvalidate: HtmlValidate;

	beforeAll(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'foo': 'error'},
		});
	});

	it('should report error when rule is not defined', function(){
		const report = htmlvalidate.validateString('<p></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('foo', 'Definition for rule \'foo\' was not found');
	});

});
