import HtmlValidate from "../htmlvalidate";
import "../matchers";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule attribute-allowed-values", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "attribute-allowed-values": "error" },
		});
	});

	it("should report error when element has invalid attribute value", () => {
		const report = htmlvalidate.validateString('<input type="foobar">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"attribute-allowed-values",
			'Attribute "type" has invalid value "foobar"'
		);
	});

	it("should report error when element has invalid boolean attribute value", () => {
		const report = htmlvalidate.validateString("<input type>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"attribute-allowed-values",
			'Attribute "type" has invalid value ""'
		);
	});

	it("should report error when element attribute should be boolean", () => {
		const report = htmlvalidate.validateString('<input required="foobar">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"attribute-allowed-values",
			'Attribute "required" has invalid value "foobar"'
		);
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

	it("should not report error when attribute is dynamic", () => {
		const report = htmlvalidate.validateString(
			'<input type="{{ interpolated }}" required="{{ interpolated }}"><input dynamic-type="dynamic" dynamic-required="dynamic">',
			null,
			{
				processAttribute,
			}
		);
		expect(report).toBeValid();
	});

	it("smoketest", () => {
		const report = htmlvalidate.validateFile(
			"test-files/rules/attribute-allowed-values.html"
		);
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect(
			htmlvalidate.getRuleDocumentation("attribute-allowed-values")
		).toMatchSnapshot();
	});

	it("should contain contextual documentation", () => {
		const context = {
			element: "any",
			attribute: "foo",
			value: "bar",
			allowed: ["spam", "ham", /\d+/],
		};
		expect(
			htmlvalidate.getRuleDocumentation(
				"attribute-allowed-values",
				null,
				context
			)
		).toMatchSnapshot();
	});

	it("should contain contextual documentation when attribute should be boolean", () => {
		const context = {
			element: "any",
			attribute: "foo",
			value: "bar",
			allowed: [] as string[],
		};
		expect(
			htmlvalidate.getRuleDocumentation(
				"attribute-allowed-values",
				null,
				context
			)
		).toMatchSnapshot();
	});
});
