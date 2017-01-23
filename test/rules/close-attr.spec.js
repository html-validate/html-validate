'use strict';

var expect = require('chai').expect;
var HtmlLint = require('../htmllint');

describe('rule close-attr', function(){
	var htmllint;

	before(function(){
		htmllint = new HtmlLint();
	});

	it('should not report when close tags are correct', function(){
		var report = {};
		expect(htmllint.string('<div></div>', report), "should parse valid html").to.be.true;
		expect(report.valid, "linting should report success").to.be.true;
		expect(report.error, "report should contain no errors").to.have.lengthOf(0);
	});

	it('should report when close tags contains attributes', function(){
		var report = {};
		var html = "<p></p foo=\"bar\"><p></p foo='bar'><p></p foo>";
		expect(htmllint.string(html, report), "should parse malformed html").to.be.true;
		expect(report.valid, "linting should report failure").to.be.false;
		expect(report.error, "report should contain 3 errors").to.have.lengthOf(3);
		expect(report.error[0].rule, "reported error should be close-attr").to.equal('close-attr');
		expect(report.error[1].rule, "reported error should be close-attr").to.equal('close-attr');
		expect(report.error[2].rule, "reported error should be close-attr").to.equal('close-attr');
	});

});
