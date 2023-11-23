import { HtmlValidate } from "../../htmlvalidate";
import "../../jest";

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

	it("should report error when <fieldset> is missing <legend>", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString("<fieldset></fieldset>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("wcag/h71", "<fieldset> must have a <legend> as the first child");
	});

	it("should report error when custom element inherits from <fieldset>", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString("<custom></custom>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("wcag/h71", "<custom> must have a <legend> as the first child");
	});

	it("should not report when <fieldset> have <legend>", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<fieldset><legend>foo</legend></fieldset>");
		expect(report).toBeValid();
	});

	it("should not report when <fieldset> have multiple <legend>", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString(
			"<fieldset><legend>foo</legend><legend>bar</legend></fieldset>",
		);
		expect(report).toBeValid();
	});

	it("should not report when <fieldset> have out-of-order <legend>", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString(
			"<fieldset><div>foo</div><legend>bar</legend></fieldset>",
		);
		expect(report).toBeValid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h71": "error" },
		});
		const docs = await htmlvalidate.getContextualDocumentation({ ruleId: "wcag/h71" });
		expect(docs).toMatchSnapshot();
	});
});
