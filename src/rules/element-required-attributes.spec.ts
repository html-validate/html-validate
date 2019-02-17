import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule element-required-attributes", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "element-required-attributes": "error" },
		});
	});

	it("should report error when required attribute is missing", () => {
		const report = htmlvalidate.validateString("<input>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"element-required-attributes",
			'<input> is missing required attribute "type"'
		);
	});

	it("should not report error when element has required attribute attribute", () => {
		const report = htmlvalidate.validateString('<input type="text">');
		expect(report).toBeValid();
	});

	it("should not report error when element has empty attribute", () => {
		const report = htmlvalidate.validateString('<input type="">');
		expect(report).toBeValid();
	});

	it("should not report error when element is missing meta", () => {
		const report = htmlvalidate.validateString('<foo-bar type="text">');
		expect(report).toBeValid();
	});

	it("smoketest", () => {
		const report = htmlvalidate.validateFile(
			"test-files/rules/element-required-attributes.html"
		);
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect(
			htmlvalidate.getRuleDocumentation("element-required-attributes")
		).toMatchSnapshot();
	});

	it("should contain contextual documentation", () => {
		const context = {
			element: "any",
			attribute: "foo",
		};
		expect(
			htmlvalidate.getRuleDocumentation(
				"element-required-attributes",
				null,
				context
			)
		).toMatchSnapshot();
	});
});
