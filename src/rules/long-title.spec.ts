import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule long-title", () => {
	let htmlvalidate: HtmlValidate;

	it("should report when title has long text", () => {
		htmlvalidate = new HtmlValidate({
			rules: { "long-title": "error" },
		});
		const report = htmlvalidate.validateString(
			"<title>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</title>"
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"long-title",
			"title text cannot be longer than 70 characters"
		);
	});

	it("should not report when title has short text", () => {
		htmlvalidate = new HtmlValidate({
			rules: { "long-title": "error" },
		});
		const report = htmlvalidate.validateString("<title>lorem ipsum</title>");
		expect(report).toBeValid();
	});

	it("should support setting custom max length", () => {
		htmlvalidate = new HtmlValidate({
			rules: { "long-title": ["error", { maxlength: 10 }] },
		});
		const report = htmlvalidate.validateString(
			"<title>lorem ipsum dolor sit amet</title>"
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"long-title",
			"title text cannot be longer than 10 characters"
		);
	});

	it("should contain documentation", () => {
		expect(htmlvalidate.getRuleDocumentation("long-title")).toMatchSnapshot();
	});
});
