import HtmlValidate from '../htmlvalidate';

describe('rule no-implicit-close', function(){
	let htmlvalidate: HtmlValidate;

	beforeAll(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'no-implicit-close': 'error'},
		});
	});

	it('should not report when element is explicitly closed', function(){
		const report = htmlvalidate.validateString('<li></li>');
		expect(report).toBeValid();
	});

	it('should report error when element is implicitly closed by parent', function(){
		const report = htmlvalidate.validateString('<ul><li>foo</ul>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('no-implicit-close', 'Element <li> is implicitly closed by parent </ul>');
	});

	it('should report error when element is implicitly closed by sibling', function(){
		const report = htmlvalidate.validateString('<li>foo<li>bar');
		expect(report).toBeInvalid();
		expect(report).toHaveError('no-implicit-close', 'Element <li> is implicitly closed by sibling');
	});

	it('smoketest', () => {
		const report = htmlvalidate.validateFile('test-files/rules/no-implicit-close.html');
		expect(report.results).toMatchSnapshot();
	});

});
