import HtmlValidate from "../../htmlvalidate";
import "../../matchers";

describe("wcag/h67", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h67": "error" },
		});
	});

	it("should not report when img has neither alt or title", () => {
		const report = htmlvalidate.validateString("<img>");
		expect(report).toBeValid();
	});

	it("should not report when img is missing title", () => {
		const report = htmlvalidate.validateString('<img alt="foo">');
		expect(report).toBeValid();
	});

	it("should not report when img has both alt and title", () => {
		const report = htmlvalidate.validateString('<img alt="foo" title="bar">');
		expect(report).toBeValid();
	});

	it("should not report when img is both alt and title is empty", () => {
		const report = htmlvalidate.validateString('<img alt="" title="">');
		expect(report).toBeValid();
	});

	it("should report error when img has only title", () => {
		const report = htmlvalidate.validateString('<img title="bar">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"WCAG/H67",
			"<img> with empty alt text cannot have title attribute"
		);
	});

	it("should report error when img has empty alt and title", () => {
		const report = htmlvalidate.validateString('<img title="bar">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"WCAG/H67",
			"<img> with empty alt text cannot have title attribute"
		);
	});

	it("smoketest", () => {
		const report = htmlvalidate.validateFile("test-files/rules/wcag/h67.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h67": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("wcag/h67")).toMatchSnapshot();
	});
});
