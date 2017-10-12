import HtmlValidate from '../htmlvalidate';

describe('rule void', function() {

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	describe('default', function(){

		before(function() {
			htmlvalidate = new HtmlValidate({
				rules: { 'void': 'error' },
			});
		});

		it('should not report when void element omitted end tag', function() {
			const report = htmlvalidate.string('<input>');
			expect(report).to.be.valid;
		});

		it('should report when void element is self-closed', function() {
			const report = htmlvalidate.string('<input/>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('void', 'Expected omitted end tag <input> instead of self-closing element <input/>');
		});

		it('should not report when non-void element has end tag', function() {
			const report = htmlvalidate.string('<div></div>');
			expect(report).to.be.valid;
		});

		it('should not report when xml namespaces is used', function() {
			const report = htmlvalidate.string('<xi:include/>');
			expect(report).to.be.valid;
		});

		it('should report error when non-void element omitted end tag', function(){
			const report = htmlvalidate.string('<div/>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('void', 'End tag for <div> must not be omitted');
		});

	});

	describe('configured with style="omit"', function(){

		before(function() {
			htmlvalidate = new HtmlValidate({
				rules: { 'void': ['error', {style: 'omit'}]},
			});
		});

		it('should not report when void element omits end tag', function() {
			const report = htmlvalidate.string('<input>');
			expect(report).to.be.valid;
		});

		it('should report when void element is self-closed', function() {
			const report = htmlvalidate.string('<input/>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('void', 'Expected omitted end tag <input> instead of self-closing element <input/>');
		});

	});

	describe('configured with style="selfclose"', function(){

		before(function() {
			htmlvalidate = new HtmlValidate({
				rules: { 'void': ['error', {style: 'selfclose'}]},
			});
		});

		it('should report when void element omits end tag', function() {
			const report = htmlvalidate.string('<input>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('void', 'Expected self-closing element <input/> instead of omitted end-tag <input>');
		});

		it('should not report when void element is self-closed', function() {
			const report = htmlvalidate.string('<input/>');
			expect(report).to.be.valid;
		});

	});

	describe('configured with style="any"', function(){

		before(function() {
			htmlvalidate = new HtmlValidate({
				rules: { 'void': ['error', {style: 'any'}]},
			});
		});

		it('should not report when void element omits end tag', function() {
			const report = htmlvalidate.string('<input>');
			expect(report).to.be.valid;
		});

		it('should not report when void element is self-closed', function() {
			const report = htmlvalidate.string('<input/>');
			expect(report).to.be.valid;
		});

	});

});
