import HtmlValidate from '../htmlvalidate';
import '../matchers';

describe('rule img-req-alt', function(){

	let htmlvalidate: HtmlValidate;

	describe('with default options', function(){

		beforeAll(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'img-req-alt': 'error'},
			});
		});

		it('should not report when img has alt attribute', function(){
			const report = htmlvalidate.validateString('<img alt="foobar">');
			expect(report).toBeValid();
		});

		it('should not report when img has empty alt attribute', function(){
			const report = htmlvalidate.validateString('<img alt="">');
			expect(report).toBeValid();
		});

		it('should report error when img is missing alt attribute', function(){
			const report = htmlvalidate.validateString('<img>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('img-req-alt', '<img> is missing required alt attribute');
		});

		it('smoketest', () => {
			const report = htmlvalidate.validateFile('test-files/rules/img-req-alt.html');
			expect(report.results).toMatchSnapshot();
		});

	});

	describe('with allowEmpty false', function(){

		beforeAll(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'img-req-alt': ['error', {allowEmpty: false}]},
			});
		});

		it('should not report when img has alt attribute', function(){
			const report = htmlvalidate.validateString('<img alt="foobar">');
			expect(report).toBeValid();
		});

		it('should report when img has empty alt attribute', function(){
			const report = htmlvalidate.validateString('<img alt="">');
			expect(report).toBeInvalid();
			expect(report).toHaveError('img-req-alt', '<img> is missing required alt attribute');
		});

		it('should report error when img is missing alt attribute', function(){
			const report = htmlvalidate.validateString('<img>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('img-req-alt', '<img> is missing required alt attribute');
		});

		it('smoketest', () => {
			const report = htmlvalidate.validateFile('test-files/rules/img-req-alt.html');
			expect(report.results).toMatchSnapshot();
		});

	});

	describe('with alias', function(){

		beforeAll(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'img-req-alt': ['error', {alias: 'translate-attr'}]},
			});
		});

		it('should not report when img has alias attribute set', function(){
			const report = htmlvalidate.validateString('<img translate-attr="...">');
			expect(report).toBeValid();
		});

		it('should report error when img is missing both alt and aliases', function(){
			const report = htmlvalidate.validateString('<img>');
			expect(report).toBeInvalid();
			expect(report).toHaveError('img-req-alt', '<img> is missing required alt attribute');
		});

		it('smoketest', () => {
			const report = htmlvalidate.validateFile('test-files/rules/img-req-alt.html');
			expect(report.results).toMatchSnapshot();
		});

	});

	describe('with alias (array)', function(){

		beforeAll(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'img-req-alt': ['error', {alias: ['translate-attr']}]},
			});
		});

		it('should not report when img has alias attribute set', function(){
			const report = htmlvalidate.validateString('<img translate-attr="...">');
			expect(report).toBeValid();
		});

		it('smoketest', () => {
			const report = htmlvalidate.validateFile('test-files/rules/img-req-alt.html');
			expect(report.results).toMatchSnapshot();
		});

	});

});
