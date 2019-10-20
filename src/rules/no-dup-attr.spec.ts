import HtmlValidate from "../htmlvalidate";
import "../matchers";
import { processAttribute } from "../transform/mocks/attribute";

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

	it("should not report error when attribute is dynamic", () => {
		const report = htmlvalidate.validateString(
			'<input class="foo" dynamic-class="bar">',
			null,
			{ processAttribute }
		);
		expect(report).toBeValid();
	});

	it("should report when attribute is duplicated", () => {
		const report = htmlvalidate.validateString(
			'<p foo="bar" foo="baz"></p></p>'
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-dup-attr", 'Attribute "foo" duplicated');
	});

	it("should report when attribute is duplicated case insensitive", () => {
		const report = htmlvalidate.validateString(
			'<p foo="bar" FOO="baz"></p></p>'
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-dup-attr", 'Attribute "foo" duplicated');
	});

	it("should report error when dynamic element is used multiple times", () => {
		const report = htmlvalidate.validateString(
			'<input dynamic-class="foo" dynamic-class="bar">',
			null,
			{ processAttribute }
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-dup-attr",
			'Attribute "dynamic-class" duplicated'
		);
	});

	it("smoketest", () => {
		const report = htmlvalidate.validateFile(
			"test-files/rules/no-dup-attr.html"
		);
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect(htmlvalidate.getRuleDocumentation("no-dup-attr")).toMatchSnapshot();
	});
});
