import HtmlValidate from '../htmlvalidate';
import '../matchers';

describe('rule element-permitted-order', function(){
	let htmlvalidate: HtmlValidate;

	beforeAll(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'element-permitted-order': 'error'},
		});
	});

	it('should report error when child is used in wrong order', function(){
		const report = htmlvalidate.validateString('<table><thead></thead><caption></caption></table>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('element-permitted-order', 'Element <caption> must be used before <thead> in this context');
	});

	it('should not report error when child is used in right order', function(){
		const report = htmlvalidate.validateString('<table><caption></caption><thead></thead></table>');
		expect(report).toBeValid();
	});

	it('should not report error when disallowed child is used', function(){
		const report = htmlvalidate.validateString('<table><foo></foo></table>');
		expect(report).toBeValid();
	});

	it('should not report error when child with unspecified order is used', function(){
		const report = htmlvalidate.validateString('<table><caption></caption><template></template><thead></thead></table>');
		expect(report).toBeValid();
	});

});
