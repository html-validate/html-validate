import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule no-dup-attr", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-dup-attr": "error" },
		});
	});

	it("should not report when no attribute is duplicated", () => {
		const report = htmlvalidate.validateString('<p foo="bar"></p>');
		expect(report).toBeValid();
	});

	it("should report when attribute is duplicated", () => {
		const report = htmlvalidate.validateString('<p foo="bar" foo="baz"></p></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-dup-attr", 'Attribute "foo" duplicated');
	});

	it("should report when attribute is duplicated case insensitive", () => {
		const report = htmlvalidate.validateString('<p foo="bar" FOO="baz"></p></p>');
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-dup-attr", 'Attribute "foo" duplicated');
	});

	it("smoketest", () => {
		const report = htmlvalidate.validateFile("test-files/rules/no-dup-attr.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect(htmlvalidate.getRuleDocumentation("no-dup-attr")).toMatchSnapshot();
	});

});
