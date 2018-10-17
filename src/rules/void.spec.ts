import HtmlValidate from '../htmlvalidate';
import '../matchers';

describe('rule void', function() {
	let htmlvalidate: HtmlValidate;

	describe('default', function(){

		beforeAll(function() {
			htmlvalidate = new HtmlValidate({
				rules: { 'void': 'error' },
			});
		});

		it('should not report when void element omitted end tag', function() {
			const report = htmlvalidate.validateString('<input>');
			expect(report).toBeValid();
		});

		it('should report when void element is self-closed', function() {
			const report = htmlvalidate.validateString('<input/>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('void', 'Expected omitted end tag <input> instead of self-closing element <input/>');
		});

		it('should not report when non-void element has end tag', function() {
			const report = htmlvalidate.validateString('<div></div>');
			expect(report).toBeValid();
		});

		it('should not report when xml namespaces is used', function() {
			const report = htmlvalidate.validateString('<xi:include/>');
			expect(report).toBeValid();
		});

		it('should report error when non-void element omitted end tag', function(){
			const report = htmlvalidate.validateString('<div/>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('void', 'End tag for <div> must not be omitted');
		});

		it('smoketest', () => {
			const report = htmlvalidate.validateFile('test-files/rules/void.html');
			expect(report.results).toMatchSnapshot();
		});

	});

	describe('configured with style="omit"', function(){

		beforeAll(function() {
			htmlvalidate = new HtmlValidate({
				rules: { 'void': ['error', {style: 'omit'}]},
			});
		});

		it('should not report when void element omits end tag', function() {
			const report = htmlvalidate.validateString('<input>');
			expect(report).toBeValid();
		});

		it('should report when void element is self-closed', function() {
			const report = htmlvalidate.validateString('<input/>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('void', 'Expected omitted end tag <input> instead of self-closing element <input/>');
		});

		it('smoketest', () => {
			const report = htmlvalidate.validateFile('test-files/rules/void.html');
			expect(report.results).toMatchSnapshot();
		});

	});

	describe('configured with style="selfclose"', function(){

		beforeAll(function() {
			htmlvalidate = new HtmlValidate({
				rules: { 'void': ['error', {style: 'selfclose'}]},
			});
		});

		it('should report when void element omits end tag', function() {
			const report = htmlvalidate.validateString('<input>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('void', 'Expected self-closing element <input/> instead of omitted end-tag <input>');
		});

		it('should not report when void element is self-closed', function() {
			const report = htmlvalidate.validateString('<input/>');
			expect(report).toBeValid();
		});

		it('smoketest', () => {
			const report = htmlvalidate.validateFile('test-files/rules/void.html');
			expect(report.results).toMatchSnapshot();
		});

	});

	describe('configured with style="any"', function(){

		beforeAll(function() {
			htmlvalidate = new HtmlValidate({
				rules: { 'void': ['error', {style: 'any'}]},
			});
		});

		it('should not report when void element omits end tag', function() {
			const report = htmlvalidate.validateString('<input>');
			expect(report).toBeValid();
		});

		it('should not report when void element is self-closed', function() {
			const report = htmlvalidate.validateString('<input/>');
			expect(report).toBeValid();
		});

		it('smoketest', () => {
			const report = htmlvalidate.validateFile('test-files/rules/void.html');
			expect(report.results).toMatchSnapshot();
		});

	});

});
