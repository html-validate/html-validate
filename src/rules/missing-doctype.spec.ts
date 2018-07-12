import HtmlValidate from '../htmlvalidate';

describe('rule missing-doctype', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'missing-doctype': 'error'},
		});
	});

	it('should report error when document is missing doctype', function(){
		const report = htmlvalidate.validateString('<html></html>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('missing-doctype', 'Document is missing doctype');
	});

	it('should not report error when document has doctype', function(){
		const report = htmlvalidate.validateString('<!doctype html><html></html>');
		expect(report).to.be.valid;
	});

});
