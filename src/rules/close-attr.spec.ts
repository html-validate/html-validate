import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule close-attr", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "close-attr": "error" },
		});
	});

	it("should not report when close tags are correct", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<div></div>");
		expect(report).toBeValid();
	});

	it("should not report errors on self-closing tags", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<input required/>");
		expect(report).toBeValid();
	});

	it("should not report errors on void tags", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<input required>");
		expect(report).toBeValid();
	});

	it("should report when close tags contains attributes", () => {
		expect.assertions(2);
		const html = "<p></p foo=\"bar\"><p></p foo='bar'><p></p foo>";
		const report = htmlvalidate.validateString(html);
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			["close-attr", "Close tags cannot have attributes"],
			["close-attr", "Close tags cannot have attributes"],
			["close-attr", "Close tags cannot have attributes"],
		]);
	});

	it("should handle unclosed tags", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<p>");
		expect(report).toBeValid();
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile(
			"test-files/rules/close-attr.html"
		);
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("close-attr")).toMatchSnapshot();
	});
});
