import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule attribute-allowed-values", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: {"attribute-allowed-values": "error"},
		});
	});

	it("should report error when element has invalid attribute value", () => {
		const report = htmlvalidate.validateString('<input type="foobar">');
		expect(report).toBeInvalid();
		expect(report).toHaveError("attribute-allowed-values", 'Attribute "type" has invalid value "foobar"');
	});

	it("should not report error when element has valid attribute value", () => {
		const report = htmlvalidate.validateString('<input type="text">');
		expect(report).toBeValid();
	});

	it("should not report error when element is missing meta", () => {
		const report = htmlvalidate.validateString('<foo-bar type="text">');
		expect(report).toBeValid();
	});

	it("should not report error when element has no attribute specification", () => {
		const report = htmlvalidate.validateString('<div id="text">');
		expect(report).toBeValid();
	});

	it("smoketest", () => {
		const report = htmlvalidate.validateFile("test-files/rules/attribute-allowed-values.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect(htmlvalidate.getRuleDocumentation("attribute-allowed-values")).toMatchSnapshot();
	});

	it("should contain contextual documentation", () => {
		const context = {
			element: "any",
			attribute: "foo",
			value: "bar",
			allowed: ["spam", "ham", /\d+/],
		};
		expect(htmlvalidate.getRuleDocumentation("attribute-allowed-values", null, context)).toMatchSnapshot();
	});

});
