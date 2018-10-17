import HtmlValidate from '../htmlvalidate';
import '../matchers';

describe('rule element-name', function(){

	let htmlvalidate: HtmlValidate;

	describe('configured with default pattern', function(){

		beforeAll(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'element-name': 'error'},
			});
		});

		it('should report error when custom element name does not have a dash', function(){
			const report = htmlvalidate.validateString('<foobar></foobar>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('element-name', '<foobar> is not a valid element name');
		});

		it('should report error when custom element name does not start with letter', function(){
			const report = htmlvalidate.validateString('<1-foo></1-foo>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('element-name', '<1-foo> is not a valid element name');
		});

		it('should not report error when custom element name is valid', function(){
			const report = htmlvalidate.validateString('<foo-bar></foo-bar>');
			expect(report).toBeValid();
		});

		it('should not report when using builtin elements', function(){
			const report = htmlvalidate.validateString('<span><a><span></span></a></span>');
			expect(report).toBeValid();
		});

		it('should not report error for xml namespaces', function(){
			const report = htmlvalidate.validateString('<xmlns:foo></xmlns:foo>');
			expect(report).toBeValid();
		});

		it('smoketest', () => {
			const report = htmlvalidate.validateFile('test-files/rules/element-name.html');
			expect(report.results).toMatchSnapshot();
		});

	});

	describe('configured with custom pattern', function(){

		beforeAll(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'element-name': ['error', {pattern: '^foo-\\w+$'}]},
			});
		});

		it('should report error when custom element name does not match pattern', function(){
			const report = htmlvalidate.validateString('<spam-ham></spam-ham>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('element-name', '<spam-ham> is not a valid element name');
		});

		it('should not report error when custom element name does match pattern', function(){
			const report = htmlvalidate.validateString('<foo-bar></foo-bar>');
			expect(report).toBeValid();
		});

		it('should not report when using builtin elements', function(){
			const report = htmlvalidate.validateString('<span><a><span></span></a></span>');
			expect(report).toBeValid();
		});

		it('should not report error for xml namespaces', function(){
			const report = htmlvalidate.validateString('<xmlns:foo></xmlns:foo>');
			expect(report).toBeValid();
		});

		it('smoketest', () => {
			const report = htmlvalidate.validateFile('test-files/rules/element-name.html');
			expect(report.results).toMatchSnapshot();
		});

	});

	it('should ignore whitelisted element', function(){
		htmlvalidate = new HtmlValidate({
			rules: {'element-name': ['error', {whitelist: ['foobar']}]},
		});
		const report = htmlvalidate.validateString('<foobar></foobar>');
		expect(report).toBeValid();
	});

	it('should report error when using blacklisted element', function(){
		htmlvalidate = new HtmlValidate({
			rules: {'element-name': ['error', {blacklist: ['foo-bar']}]},
		});
		const report = htmlvalidate.validateString('<foo-bar></foo-bar>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('element-name', '<foo-bar> element is blacklisted');
	});

});
