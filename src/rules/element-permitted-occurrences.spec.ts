import HtmlValidate from '../htmlvalidate';

describe('rule element-permitted-occurrences', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'element-permitted-occurrences': 'error'},
		});
	});

	it('should report error when child has too many occurrences', function(){
		const report = htmlvalidate.validateString('<table><caption>1</caption><caption>2</caption></table>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('element-permitted-occurrences', 'Element <caption> can only appear once under <table>');
	});

	it('should not report error when child has right number of occurrences', function(){
		const report = htmlvalidate.validateString('<table><caption></caption></table>');
		expect(report).to.be.valid;
	});

	it('should not report error when child has unrestricted number of occurrences', function(){
		const report = htmlvalidate.validateString('<div><p>1</p><p>2</p><p>3</p></div>');
		expect(report).to.be.valid;
	});

});
