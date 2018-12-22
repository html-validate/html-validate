import HtmlValidate from '../htmlvalidate';
import '../matchers';

describe('rule element-case', () => {
	let htmlvalidate: HtmlValidate;

	describe('configured with "lowercase"', () => {

		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: {'element-case': ['error', {style: "lowercase"}]},
			});
		});

		it('should not report error when element is lowercase', () => {
			const report = htmlvalidate.validateString('<foo></foo>');
			expect(report).toBeValid();
		});

		it('should not report error when element has special characters', () => {
			const report = htmlvalidate.validateString('<foo-bar-9></foo-bar-9>');
			expect(report).toBeValid();
		});

		it('should report error when element is uppercase', () => {
			const report = htmlvalidate.validateString('<FOO></FOO>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('element-case', 'Element "FOO" should be lowercase');
		});

		it('should report error when element is mixed', () => {
			const report = htmlvalidate.validateString('<fOo></fOo>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('element-case', 'Element "fOo" should be lowercase');
		});

		it('smoketest', () => {
			const report = htmlvalidate.validateFile('test-files/rules/element-case.html');
			expect(report.results).toMatchSnapshot();
		});

	});

	describe('configured with "uppercase"', () => {

		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: {'element-case': ['error', {style: "uppercase"}]},
			});
		});

		it('should report error when element is lowercase', () => {
			const report = htmlvalidate.validateString('<foo></foo>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('element-case', 'Element "foo" should be uppercase');
		});

		it('should not report error when element has special characters', () => {
			const report = htmlvalidate.validateString('<FOO-BAR-9></FOO-BAR-9>');
			expect(report).toBeValid();
		});

		it('should not report error when element is uppercase', () => {
			const report = htmlvalidate.validateString('<FOO></FOO>');
			expect(report).toBeValid();
		});

		it('should report error when element is mixed', () => {
			const report = htmlvalidate.validateString('<fOo></fOo>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('element-case', 'Element "fOo" should be uppercase');
		});

		it('smoketest', () => {
			const report = htmlvalidate.validateFile('test-files/rules/element-case.html');
			expect(report.results).toMatchSnapshot();
		});

	});

	it('should throw error if configured with invalid value', () => {
		htmlvalidate = new HtmlValidate({
			rules: {'element-case': ['error', {style: "foobar"}]},
		});
		expect(() => htmlvalidate.validateString('<foo></foo>')).toThrow(`Invalid style "foobar" for "element-case" rule`);
	});

});
