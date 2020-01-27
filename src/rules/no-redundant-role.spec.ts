import HtmlValidate from "../htmlvalidate";
import "../matchers";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule no-redundant-role", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-role": "error" },
		});
	});

	it("should not report error when element has non-redundant role", () => {
		const report = htmlvalidate.validateString('<li role="presentation"></li>');
		expect(report).toBeValid();
	});

	it("should not report error element has no known roles", () => {
		const report = htmlvalidate.validateString('<span role="main"></span>');
		expect(report).toBeValid();
	});

	it("should not report error when role is boolean", () => {
		const report = htmlvalidate.validateString("<div role></div>");
		expect(report).toBeValid();
	});

	it("should not report error for dynamic attributes", () => {
		const report = htmlvalidate.validateString(
			'<input dynamic-role="main">',
			null,
			{
				processAttribute,
			}
		);
		expect(report).toBeValid();
	});

	it("should report error when element has redundant role", () => {
		const htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-role": "error" },
		});
		const report = htmlvalidate.validateString('<li role="listitem"></li>');
		expect(report).toBeInvalid();
	});

	it("should contain documentation", () => {
		const htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-role": "error" },
		});
		expect(
			htmlvalidate.getRuleDocumentation("no-redundant-role")
		).toMatchSnapshot();
	});

	it("should contain contextual documentation", () => {
		const htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-role": "error" },
		});
		const context = {
			role: "checkbox",
			tagname: "input",
		};
		expect(
			htmlvalidate.getRuleDocumentation("no-redundant-role", null, context)
		).toMatchSnapshot();
	});
});
