import HtmlValidate from '../htmlvalidate';

describe('rule id-pattern', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'id-pattern': 'error'},
		});
	});

	it('should not report error when id follows pattern', function(){
		const report = htmlvalidate.string('<p id="foo-bar"></p>');
		expect(report).to.be.valid;
	});

	it('should report error when id does not follow pattern', function(){
		const report = htmlvalidate.string('<p id="fooBar"></p>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('id-pattern', /ID "fooBar" does not match required pattern ".*"/);
	});

});
