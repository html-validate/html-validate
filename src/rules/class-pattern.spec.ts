import HtmlValidate from '../htmlvalidate';
import '../matchers';

describe('rule class-pattern', function(){
	let htmlvalidate: HtmlValidate;

	beforeAll(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'class-pattern': 'error'},
		});
	});

	it('should not report error when class follows pattern', function(){
		const report = htmlvalidate.validateString('<p class="foo-bar"></p>');
		expect(report).toBeValid();
	});

	it('should report error when class does not follow pattern', function(){
		const report = htmlvalidate.validateString('<p class="foo-bar fooBar spam"></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('class-pattern', expect.stringMatching(/Class "fooBar" does not match required pattern ".*"/));
	});

	it('should ignore other attributes', () => {
		const report = htmlvalidate.validateString('<p spam="fooBar"></p>');
		expect(report).toBeValid();
	});

	it('smoketest', () => {
		const report = htmlvalidate.validateFile('test-files/rules/class-pattern.html');
		expect(report.results).toMatchSnapshot();
	});

});
