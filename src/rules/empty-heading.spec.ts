import { DynamicValue, HtmlElement } from "../dom";
import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule empty-heading", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "empty-heading": "error" },
		});
	});

	it("should not report when heading has text", () => {
		const report = htmlvalidate.validateString("<h1>lorem ipsum</h1>");
		expect(report).toBeValid();
	});

	it("should not report when heading has children with text", () => {
		const report = htmlvalidate.validateString(
			"<h1><span>lorem ipsum</span></h1>"
		);
		expect(report).toBeValid();
	});

	it("should not report when heading has dynamic text", () => {
		function processElement(node: HtmlElement): void {
			node.appendText(new DynamicValue(""));
		}
		const report = htmlvalidate.validateString("<h1></h1>", null, {
			processElement,
		});
		expect(report).toBeValid();
	});

	it("should report error when heading has no text content", () => {
		const report = htmlvalidate.validateString("<h1></h1>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"empty-heading",
			"<h1> cannot be empty, must have text content"
		);
	});

	it("should report error when heading has no children with content", () => {
		const report = htmlvalidate.validateString("<h1><span></span></h1>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"empty-heading",
			"<h1> cannot be empty, must have text content"
		);
	});

	it("should report error when heading only has whitespace content", () => {
		const report = htmlvalidate.validateString("<h1> </h1>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"empty-heading",
			"<h1> cannot be empty, must have text content"
		);
	});

	it("should report error when heading only has comment", () => {
		const report = htmlvalidate.validateString("<h1>\n<!-- foo -->\n</h1>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"empty-heading",
			"<h1> cannot be empty, must have text content"
		);
	});

	it("should report error for all heading levels", () => {
		expect(htmlvalidate.validateString("<h1></h1>")).toBeInvalid();
		expect(htmlvalidate.validateString("<h2></h2>")).toBeInvalid();
		expect(htmlvalidate.validateString("<h3></h3>")).toBeInvalid();
		expect(htmlvalidate.validateString("<h4></h4>")).toBeInvalid();
		expect(htmlvalidate.validateString("<h5></h5>")).toBeInvalid();
		expect(htmlvalidate.validateString("<h6></h6>")).toBeInvalid();
	});

	it("smoketest", () => {
		const report = htmlvalidate.validateFile(
			"test-files/rules/empty-heading.html"
		);
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect(
			htmlvalidate.getRuleDocumentation("empty-heading")
		).toMatchSnapshot();
	});
});
