import HtmlValidate from '../htmlvalidate';

describe('rule close-order', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'close-order': 'error'},
		});
	});

	it('should not report when elements are correct in wrong order', function(){
		const report = htmlvalidate.validateString('<div></div>');
		expect(report).to.be.valid;
	});

	it('should not report for self-closing element', function(){
		const report = htmlvalidate.validateString('<div><input/></div>');
		expect(report).to.be.valid;
	});

	it('should not report for self-closing element with attribute', function(){
		const report = htmlvalidate.validateString('<div><input required/></div>');
		expect(report).to.be.valid;
	});

	it('should not report for void element', function(){
		const report = htmlvalidate.validateString('<div><input></div>');
		expect(report).to.be.valid;
	});

	it('should not report for void element with attribute', function(){
		const report = htmlvalidate.validateString('<div><input required></div>');
		expect(report).to.be.valid;
	});

	it('should report error when elements are closed in wrong order', function(){
		const report = htmlvalidate.validateString('<div></p>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('close-order', 'Mismatched close-tag, expected \'</div>\' but found \'</p>\'.');
	});

	it('should report error when element is missing close tag', function(){
		const report = htmlvalidate.validateString('<div>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('close-order', 'Missing close-tag, expected \'</div>\' but document ended before it was found.');
	});

	it('should report error when element is missing opening tag', function(){
		const report = htmlvalidate.validateString('</div>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('close-order', 'Unexpected close-tag, expected opening tag.');
	});

});
