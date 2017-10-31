import HtmlValidate from '../htmlvalidate';

describe('missing rule', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'foo': 'error'},
		});
	});

	it('should report error when rule is not defined', function(){
		const report = htmlvalidate.validateString('<p></p>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('foo', 'Definition for rule \'foo\' was not found');
	});

});
