'use strict';

var expect = require('chai').expect;
var htmllint = require('../src/htmllint');

describe('parser', function(){

	describe('should parse', function(){

		it('simple element', function(){
			expect(htmllint.string('<div></div>')).to.be.true;
		});

		it('elements closed on wrong order', function(){
			expect(htmllint.string('<div><p></div></p>')).to.be.true;
		});

	});

});
