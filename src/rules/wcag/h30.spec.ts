import HtmlValidate from "../../htmlvalidate";
import "../../matchers";

describe("wcag/h30", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h30": "error" },
		});
	});

	it("should not report when link has text", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<a>lorem ipsum</a>");
		expect(report).toBeValid();
	});

	it("should not report when link has image with alt-text", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<a><img alt="lorem ipsum"></a>');
		expect(report).toBeValid();
	});

	it("should not report when link has aria-label", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<a aria-label="lorem ipsum"></a>');
		expect(report).toBeValid();
	});

	it("should not report when descendant has aria-label", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<a><span aria-label="lorem ipsum"></span></a>');
		expect(report).toBeValid();
	});

	it("should report error when link is missing text", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<a></a>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("wcag/h30", "Anchor link must have a text describing its purpose");
	});

	it("should report error when link is missing text and image alt", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<a><img></a>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("wcag/h30", "Anchor link must have a text describing its purpose");
	});

	it("should report error when link is missing text and image has empty alt", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<a><img alt=""></a>');
		expect(report).toBeInvalid();
		expect(report).toHaveError("wcag/h30", "Anchor link must have a text describing its purpose");
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/wcag/h30.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h30": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("wcag/h30")).toMatchSnapshot();
	});
});
