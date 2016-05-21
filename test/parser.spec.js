(function(){
	'use strict';

	var expect = require('chai').expect;
	var htmllint = require('../src/htmllint');

	describe('parser', function(){

		describe('should parse', function(){

			it('simple element', function(){
				expect(htmllint.string('<div></div>')).to.be.true;
			});

		});

	});

})();
