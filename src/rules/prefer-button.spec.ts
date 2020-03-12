import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule prefer-button", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "prefer-button": "error" },
		});
	});

	it("should not report error when type attribute is missing type attribute", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<input>");
		expect(report).toBeValid();
	});

	it("should not report error when type attribute is missing value", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<input type>");
		expect(report).toBeValid();
	});

	it("should not report error when using regular input fields", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<input type="text">');
		expect(report).toBeValid();
	});

	it("should report error when using type button", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<input type="button">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"prefer-button",
			'Prefer to use <button> instead of <input type="button"> when adding buttons'
		);
	});

	it("should report error when using type submit", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<input type="submit">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"prefer-button",
			'Prefer to use <button> instead of <input type="submit"> when adding buttons'
		);
	});

	it("should report error when using type reset", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<input type="reset">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"prefer-button",
			'Prefer to use <button> instead of <input type="reset"> when adding buttons'
		);
	});

	it("should report error when using type image", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<input type="image">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"prefer-button",
			'Prefer to use <button> instead of <input type="image"> when adding buttons'
		);
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile(
			"test-files/rules/prefer-button.html"
		);
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "prefer-button": "error" },
		});
		expect(
			htmlvalidate.getRuleDocumentation("prefer-button")
		).toMatchSnapshot();
	});
});
