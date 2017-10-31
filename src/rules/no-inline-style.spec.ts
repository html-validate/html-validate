import HtmlValidate from '../htmlvalidate';

describe('rule no-inline-style', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'no-inline-style': 'error'},
		});
	});

	it('should report when style attribute is used', function(){
		const report = htmlvalidate.validateString('<p style=""></p>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('no-inline-style', 'Inline style is not allowed');
	});

});
