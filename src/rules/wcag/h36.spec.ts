import HtmlValidate from "../../htmlvalidate";
import "../../matchers";

describe("wcag/h36", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h36": "error" },
		});
	});

	it("should not report when image has alt text", () => {
		const report = htmlvalidate.validateString(
			'<input type="image" alt="submit">'
		);
		expect(report).toBeValid();
	});

	it("should not report on other input fields", () => {
		const report = htmlvalidate.validateString('<input type="text">');
		expect(report).toBeValid();
	});

	it("should not report on other elements", () => {
		const report = htmlvalidate.validateString('<p type="image"></p>');
		expect(report).toBeValid();
	});

	it("should report error when image is missing alt attribute", () => {
		const report = htmlvalidate.validateString('<input type="image">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"WCAG/H36",
			"image used as submit button must have alt text"
		);
	});

	it("should report error when image has empty alt text", () => {
		const report = htmlvalidate.validateString('<input type="image" alt="">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"WCAG/H36",
			"image used as submit button must have alt text"
		);
	});

	it("should contain documentation", () => {
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h36": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("wcag/h36")).toMatchSnapshot();
	});
});
