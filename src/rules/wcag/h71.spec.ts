import HtmlValidate from "../../htmlvalidate";
import "../../matchers";

describe("wcag/h71", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			elements: [
				"html5",
				{
					custom: {
						inherit: "fieldset",
					},
				},
			],
			rules: { "wcag/h71": "error" },
		});
	});

	it("should report error when <fieldset> is missing <legend>", () => {
		const report = htmlvalidate.validateString("<fieldset></fieldset>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"WCAG/H71",
			"<fieldset> must have a <legend> as the first child"
		);
	});

	it("should report error when custom element inherits from <fieldset>", () => {
		const report = htmlvalidate.validateString("<custom></custom>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"WCAG/H71",
			"<custom> must have a <legend> as the first child"
		);
	});

	it("should not report when <fieldset> have <legend>", () => {
		const report = htmlvalidate.validateString(
			"<fieldset><legend>foo</legend></fieldset>"
		);
		expect(report).toBeValid();
	});

	it("should not report when <fieldset> have multiple <legend>", () => {
		const report = htmlvalidate.validateString(
			"<fieldset><legend>foo</legend><legend>bar</legend></fieldset>"
		);
		expect(report).toBeValid();
	});

	it("should not report when <fieldset> have out-of-order <legend>", () => {
		const report = htmlvalidate.validateString(
			"<fieldset><div>foo</div><legend>bar</legend></fieldset>"
		);
		expect(report).toBeValid();
	});

	it("should contain documentation", () => {
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h71": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("wcag/h71")).toMatchSnapshot();
	});
});
