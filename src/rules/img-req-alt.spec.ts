import HtmlValidate from '../htmlvalidate';

describe('rule img-req-alt', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	describe('with default options', function(){

		before(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'img-req-alt': 'error'},
			});
		});

		it('should not report when img has alt attribute', function(){
			const report = htmlvalidate.validateString('<img alt="foobar">');
			expect(report).to.be.valid;
		});

		it('should not report when img has empty alt attribute', function(){
			const report = htmlvalidate.validateString('<img alt="">');
			expect(report).to.be.valid;
		});

		it('should report error when img is missing alt attribute', function(){
			const report = htmlvalidate.validateString('<img>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('img-req-alt', '<img> is missing required alt attribute');
		});

	});

	describe('with allowEmpty false', function(){

		before(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'img-req-alt': ['error', {allowEmpty: false}]},
			});
		});

		it('should not report when img has alt attribute', function(){
			const report = htmlvalidate.validateString('<img alt="foobar">');
			expect(report).to.be.valid;
		});

		it('should report when img has empty alt attribute', function(){
			const report = htmlvalidate.validateString('<img alt="">');
			expect(report).to.be.invalid;
			expect(report).to.have.error('img-req-alt', '<img> is missing required alt attribute');
		});

		it('should report error when img is missing alt attribute', function(){
			const report = htmlvalidate.validateString('<img>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('img-req-alt', '<img> is missing required alt attribute');
		});

	});

	describe('with alias', function(){

		before(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'img-req-alt': ['error', {alias: 'translate-attr'}]},
			});
		});

		it('should not report when img has alias attribute set', function(){
			const report = htmlvalidate.validateString('<img translate-attr="...">');
			expect(report).to.be.valid;
		});

		it('should report error when img is missing both alt and aliases', function(){
			const report = htmlvalidate.validateString('<img>');
			expect(report).to.be.invalid;
			expect(report).to.have.error('img-req-alt', '<img> is missing required alt attribute');
		});

	});

	describe('with alias (array)', function(){

		before(function(){
			htmlvalidate = new HtmlValidate({
				rules: {'img-req-alt': ['error', {alias: ['translate-attr']}]},
			});
		});

		it('should not report when img has alias attribute set', function(){
			const report = htmlvalidate.validateString('<img translate-attr="...">');
			expect(report).to.be.valid;
		});

	});

});
