import HtmlValidate from '../htmlvalidate';

describe('rule element-permitted-order', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'element-permitted-order': 'error'},
		});
	});

	it('should report error when child is used in wrong order', function(){
		const report = htmlvalidate.validateString('<table><thead></thead><caption></caption></table>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('element-permitted-order', 'Element <caption> must be used before <thead> in this context');
	});

	it('should not report error when child is used in right order', function(){
		const report = htmlvalidate.validateString('<table><caption></caption><thead></thead></table>');
		expect(report).to.be.valid;
	});

	it('should not report error when disallowed child is used', function(){
		const report = htmlvalidate.validateString('<table><foo></foo></table>');
		expect(report).to.be.valid;
	});

	it('should not report error when child with unspecified order is used', function(){
		const report = htmlvalidate.validateString('<table><caption></caption><template></template><thead></thead></table>');
		expect(report).to.be.valid;
	});

});
