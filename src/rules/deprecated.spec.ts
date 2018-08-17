import HtmlValidate from '../htmlvalidate';

describe('rule deprecated', function() {

	let htmlvalidate: HtmlValidate;

	beforeAll(function() {
		htmlvalidate = new HtmlValidate({
			rules: { 'deprecated': 'error' },
		});
	});

	it('should not report when regular element is used', function() {
		const report = htmlvalidate.validateString('<p></p>');
		expect(report).toBeValid();
	});

	it('should report error when deprecated element is used', function() {
		const report = htmlvalidate.validateString('<marquee>foobar</marquee>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('deprecated', '<marquee> is deprecated');
	});

	it('smoketest', () => {
		const report = htmlvalidate.validateFile('test-files/rules/deprecated.html');
		expect(report.results).toMatchSnapshot();
	});

});
