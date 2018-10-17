import HtmlValidate from '../htmlvalidate';
import '../matchers';

describe('rule button-type', function(){
	let htmlvalidate: HtmlValidate;

	beforeAll(function(){
		htmlvalidate = new HtmlValidate({
			rules: {'button-type': 'error'},
		});
	});

	it('should not report when button has type="submit"', function(){
		const report = htmlvalidate.validateString('<button type="submit"></button>');
		expect(report).toBeValid();
	});

	it('should not report when button has type="button"', function(){
		const report = htmlvalidate.validateString('<button type="button"></button>');
		expect(report).toBeValid();
	});

	it('should not report when button has type="reset"', function(){
		const report = htmlvalidate.validateString('<button type="reset"></button>');
		expect(report).toBeValid();
	});

	it('should report error when type attribute is missing', function(){
		const report = htmlvalidate.validateString('<button></button>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('button-type', 'Button is missing type attribute');
	});

	it('should report error when type attribute is invalid', function(){
		const report = htmlvalidate.validateString('<button type="foo"></button>');
		expect(report).toBeInvalid();
		expect(report).toHaveError('button-type', 'Button has invalid type "foo"');
	});

	it('smoketest', () => {
		const report = htmlvalidate.validateFile('test-files/rules/button-type.html');
		expect(report.results).toMatchSnapshot();
	});

});
