import HtmlValidate from '../htmlvalidate';
import '../matchers';

describe('rule no-inline-style', () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: {'no-inline-style': 'error'},
		});
	});

	it('should report when style attribute is used', () => {
		const report = htmlvalidate.validateString('<p style=""></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('no-inline-style', 'Inline style is not allowed');
	});

	it('smoketest', () => {
		const report = htmlvalidate.validateFile('test-files/rules/no-inline-style.html');
		expect(report.results).toMatchSnapshot();
	});

});
