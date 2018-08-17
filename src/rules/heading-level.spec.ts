import HtmlValidate from '../htmlvalidate';

describe('rule heading-level', function(){
	let htmlvalidate: HtmlValidate;

	beforeAll(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'heading-level': 'error'},
		});
	});

	it('should not report error for non-headings>', function(){
		const report = htmlvalidate.validateString('<p>lorem ipsum</p>');
		expect(report).toBeValid();
	});

	it('should not report error when <h1> is followed by <h2>', function(){
		const report = htmlvalidate.validateString('<h1>heading 1</h1><h2>heading 2</h2>');
		expect(report).toBeValid();
	});

	it('should not report error when <h3> is followed by <h2>', function(){
		const report = htmlvalidate.validateString('<h1>heading 1</h1><h2>heading 2</h2><h3>heading 3</h3><h2>heading 4</h2>');
		expect(report).toBeValid();
	});

	it('should report error when <h1> is followed by <h3>', function(){
		const report = htmlvalidate.validateString('<h1>heading 1</h1><h3>heading 2</h3>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('heading-level', 'Heading level can only increase by one, expected h2');
	});

	it('should report error when initial heading isn\'t <h1>', function(){
		const report = htmlvalidate.validateString('<h2>heading 2</h2>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('heading-level', 'Initial heading level must be h1');
	});

	it('smoketest', () => {
		const report = htmlvalidate.validateFile('test-files/rules/heading-level.html');
		expect(report.results).toMatchSnapshot();
	});

});
