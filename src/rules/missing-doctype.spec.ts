import HtmlValidate from '../htmlvalidate';

describe('rule missing-doctype', function(){
	let htmlvalidate: HtmlValidate;

	beforeAll(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'missing-doctype': 'error'},
		});
	});

	it('should report error when document is missing doctype', function(){
		const report = htmlvalidate.validateString('<html></html>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('missing-doctype', 'Document is missing doctype');
	});

	it('should not report error when document has doctype', function(){
		const report = htmlvalidate.validateString('<!doctype html><html></html>');
		expect(report).toBeValid();
	});

});
