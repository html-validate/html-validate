(function(){
	'use strict';

	var expect = require('chai').expect;
	var htmllint = require('../src/htmllint');

	describe('parser', function(){

		describe('should parse', function(){

			it('simple element', function(){
				var report = {};
				expect(htmllint.string('<div></div>', report)).to.be.true;
				expect(report.valid).to.be.true;
			});

			it('wrong close-tag', function(){
				var report = {};
				expect(htmllint.string('<div></p>', report), "should parse malformed").to.be.true;
				expect(report.valid, "linting should report failure").to.be.false;
			});

		});

	});

})();
