import HtmlValidate from '../htmlvalidate';

describe('rule no-dup-class', function() {
	let htmlvalidate: HtmlValidate;

	beforeAll(function() {
		htmlvalidate = new HtmlValidate({
			rules: { 'no-dup-class': 'error' },
		});
	});

	it('should not report when class is missing', function() {
		const report = htmlvalidate.validateString('<p></p>');
		expect(report).toBeValid();
	});

	it('should not report when class has no duplicates', function() {
		const report = htmlvalidate.validateString('<p class="foo bar"></p>');
		expect(report).toBeValid();
	});

	it('should report when when class has duplicates', function() {
		const report = htmlvalidate.validateString('<p class="foo bar foo"></p></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('no-dup-class', 'Class "foo" duplicated');
	});

	it('smoketest', () => {
		const report = htmlvalidate.validateFile('test-files/rules/no-dup-class.html');
		expect(report.results).toMatchSnapshot();
	});

});
