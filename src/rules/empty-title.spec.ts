import { DynamicValue, HtmlElement } from "../dom";
import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule empty-title", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "empty-title": "error" },
		});
	});

	it("should not report when title has text", () => {
		const report = htmlvalidate.validateString("<title>lorem ipsum</title>");
		expect(report).toBeValid();
	});

	it("should not report when title has children with text", () => {
		const report = htmlvalidate.validateString(
			"<title><span>lorem ipsum</span></title>"
		);
		expect(report).toBeValid();
	});

	it("should not report when title has dynamic text", () => {
		function processElement(node: HtmlElement): void {
			node.appendText(new DynamicValue(""));
		}
		const report = htmlvalidate.validateString("<title></title>", {
			processElement,
		});
		expect(report).toBeValid();
	});

	it("should report error when title has no text content", () => {
		const report = htmlvalidate.validateString("<title></title>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"empty-title",
			"<title> cannot be empty, must have text content"
		);
	});

	it("should report error when title has no children with content", () => {
		const report = htmlvalidate.validateString("<title><span></span></title>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"empty-title",
			"<title> cannot be empty, must have text content"
		);
	});

	it("should report error when title only has whitespace content", () => {
		const report = htmlvalidate.validateString("<title> </title>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"empty-title",
			"<title> cannot be empty, must have text content"
		);
	});

	it("should report error when title only has comment", () => {
		const report = htmlvalidate.validateString(
			"<title>\n<!-- foo -->\n</title>"
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"empty-title",
			"<title> cannot be empty, must have text content"
		);
	});

	it("smoketest", () => {
		const report = htmlvalidate.validateFile(
			"test-files/rules/empty-title.html"
		);
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect(htmlvalidate.getRuleDocumentation("empty-title")).toMatchSnapshot();
	});
});
