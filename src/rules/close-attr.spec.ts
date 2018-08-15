import HtmlValidate from '../htmlvalidate';

describe('rule close-attr', function(){
	let htmlvalidate: HtmlValidate;

	beforeAll(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'close-attr': 'error'},
		});
	});

	it('should not report when close tags are correct', function(){
		const report = htmlvalidate.validateString('<div></div>');
		expect(report).toBeValid();
	});

	it('should not report errors on self-closing tags', function(){
		const report = htmlvalidate.validateString('<input required/>');
		expect(report).toBeValid();
	});

	it('should not report errors on void tags', function(){
		const report = htmlvalidate.validateString('<input required>');
		expect(report).toBeValid();
	});

	it('should report when close tags contains attributes', function(){
		const html = "<p></p foo=\"bar\"><p></p foo='bar'><p></p foo>";
		const report = htmlvalidate.validateString(html);
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			['close-attr', 'Close tags cannot have attributes'],
			['close-attr', 'Close tags cannot have attributes'],
			['close-attr', 'Close tags cannot have attributes'],
		]);
	});

});
