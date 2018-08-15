import HtmlValidate from '../htmlvalidate';

describe('rule no-trailing-whitespace', function(){
	let htmlvalidate: HtmlValidate;

	beforeAll(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'no-trailing-whitespace': 'error'},
		});
	});

	it('should not report when there is no trailing whitespace', function(){
		const report = htmlvalidate.validateString('<div>\n  foo\n</div>');
		expect(report).toBeValid();
	});

	it('should report error when tag have trailing whitespace', function(){
		const report = htmlvalidate.validateString('<p>  \n</p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('no-trailing-whitespace', 'Trailing whitespace');
	});

	it('should report error when empty line have trailing whitespace', function(){
		const report = htmlvalidate.validateString('<p>\n  \n</p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('no-trailing-whitespace', 'Trailing whitespace');
	});

	it('should report error for both tabs and spaces', function(){
		const report = htmlvalidate.validateString('<p>\n  \n\t\n</p>');
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			['no-trailing-whitespace', 'Trailing whitespace'],
			['no-trailing-whitespace', 'Trailing whitespace'],
		]);
	});

});
