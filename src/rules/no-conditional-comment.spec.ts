import HtmlValidate from '../htmlvalidate';

describe('rule no-conditional-comment', function(){

	const expect = require('chai').expect;

	let htmlvalidate: HtmlValidate;

	before(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'no-conditional-comment': 'error'},
		});
	});

	it('should not report error for regular HTML comment', function(){
		const report = htmlvalidate.validateString('<!-- -->');
		expect(report).to.be.valid;
	});

	it('should report error when <![...]> is used', function(){
		const report = htmlvalidate.validateString('<![if foo]>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('no-conditional-comment', 'Use of conditional comments are deprecated');
	});

	it('should report error when <!--[...]> is used', function(){
		const report = htmlvalidate.validateString('<!--[if foo]>');
		expect(report).to.be.invalid;
		expect(report).to.have.error('no-conditional-comment', 'Use of conditional comments are deprecated');
	});

	it('should report error when <![...]--> is used', function(){
		const report = htmlvalidate.validateString('<![endif]-->');
		expect(report).to.be.invalid;
		expect(report).to.have.error('no-conditional-comment', 'Use of conditional comments are deprecated');
	});

});
