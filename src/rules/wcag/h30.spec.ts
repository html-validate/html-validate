import HtmlValidate from "../../htmlvalidate";
import "../../jest";

describe("wcag/h30", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "wcag/h30": "error" },
		});
	});

	it("should not report when link has text", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a>lorem ipsum</a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when link has image with alt-text", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a><img alt="lorem ipsum" /></a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when link has svg with <title>", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<a>
				<svg><title>lorem ipsum</title></svg>
			</a>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when link has svg with <desc>", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<a>
				<svg><desc>lorem ipsum</desc></svg>
			</a>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when link has aria-label", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a aria-label="lorem ipsum"></a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when descendant has aria-label", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a><span aria-label="lorem ipsum"></span></a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when link is hidden from accessibility tree", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a aria-hidden="true"></a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when link is missing text", () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a></a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("wcag/h30", "Anchor link must have a text describing its purpose");
	});

	it("should report error when link is missing text and image alt", () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a><img /></a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("wcag/h30", "Anchor link must have a text describing its purpose");
	});

	it("should report error when link is missing text and image has empty alt", () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a><img alt="" /></a>`;
		const report = htmlvalidate.validateString(markup);
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
