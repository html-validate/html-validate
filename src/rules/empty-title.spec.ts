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
		expect.assertions(1);
		const report = htmlvalidate.validateString("<title>lorem ipsum</title>");
		expect(report).toBeValid();
	});

	it("should not report when title has children with text", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			"<title><span>lorem ipsum</span></title>"
		);
		expect(report).toBeValid();
	});

	it("should not report when title has dynamic text", () => {
		expect.assertions(1);
		function processElement(node: HtmlElement): void {
			node.appendText(new DynamicValue(""));
		}
		const report = htmlvalidate.validateString("<title></title>", null, {
			processElement,
		});
		expect(report).toBeValid();
	});

	it("should report error when title has no text content", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<title></title>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"empty-title",
			"<title> cannot be empty, must have text content"
		);
	});

	it("should report error when title has no children with content", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<title><span></span></title>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"empty-title",
			"<title> cannot be empty, must have text content"
		);
	});

	it("should report error when title only has whitespace content", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<title> </title>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"empty-title",
			"<title> cannot be empty, must have text content"
		);
	});

	it("should report error when title only has comment", () => {
		expect.assertions(2);
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
		expect.assertions(1);
		const report = htmlvalidate.validateFile(
			"test-files/rules/empty-title.html"
		);
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("empty-title")).toMatchSnapshot();
	});
});
