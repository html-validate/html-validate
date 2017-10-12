import HtmlValidate from '../htmlvalidate';

describe('rule class-pattern', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'class-pattern': 'error'},
		});
	});

	it('should not report error when class follows pattern', function(){
		const report = htmlvalidate.string('<p class="foo-bar"></p>');
		expect(report).to.be.valid;
	});

	it('should report error when class does not follow pattern', function(){
		const report = htmlvalidate.string('<p class="foo-bar fooBar spam"></p>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('class-pattern', /Class "fooBar" does not match required pattern ".*"/);
	});

});
