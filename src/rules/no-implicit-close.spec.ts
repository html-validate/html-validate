import HtmlValidate from '../htmlvalidate';

describe('rule no-implicit-close', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'no-implicit-close': 'error'},
		});
	});

	it('should not report when element is explicitly closed', function(){
		const report = htmlvalidate.validateString('<li></li>');
		expect(report).to.be.valid;
	});

	it('should report error when element is implicitly closed by parent', function(){
		const report = htmlvalidate.validateString('<ul><li>foo</ul>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('no-implicit-close', 'Element <li> is implicitly closed by parent </ul>');
	});

	it('should report error when element is implicitly closed by sibling', function(){
		const report = htmlvalidate.validateString('<li>foo<li>bar');
		expect(report).to.be.invalid;
		expect(report).to.have.error('no-implicit-close', 'Element <li> is implicitly closed by sibling');
	});

});
