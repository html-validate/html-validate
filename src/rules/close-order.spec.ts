import HtmlValidate from '../htmlvalidate';

describe('rule close-order', function(){
	let htmlvalidate: HtmlValidate;

	beforeAll(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'close-order': 'error'},
		});
	});

	it('should not report when elements are correct in wrong order', function(){
		const report = htmlvalidate.validateString('<div></div>');
		expect(report).toBeValid();
	});

	it('should not report for self-closing element', function(){
		const report = htmlvalidate.validateString('<div><input/></div>');
		expect(report).toBeValid();
	});

	it('should not report for self-closing element with attribute', function(){
		const report = htmlvalidate.validateString('<div><input required/></div>');
		expect(report).toBeValid();
	});

	it('should not report for void element', function(){
		const report = htmlvalidate.validateString('<div><input></div>');
		expect(report).toBeValid();
	});

	it('should not report for void element with attribute', function(){
		const report = htmlvalidate.validateString('<div><input required></div>');
		expect(report).toBeValid();
	});

	it('should report error when elements are closed in wrong order', function(){
		const report = htmlvalidate.validateString('<div></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('close-order', 'Mismatched close-tag, expected \'</div>\' but found \'</p>\'.');
	});

	it('should report error when element is missing close tag', function(){
		const report = htmlvalidate.validateString('<div>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('close-order', 'Missing close-tag, expected \'</div>\' but document ended before it was found.');
	});

	it('should report error when element is missing opening tag', function(){
		const report = htmlvalidate.validateString('</div>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('close-order', 'Unexpected close-tag, expected opening tag.');
	});

	it('smoketest', () => {
		const report = htmlvalidate.validateFile('test-files/rules/close-order.html');
		expect(report.results).toMatchSnapshot();
	});

});
