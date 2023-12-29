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
		const markup = /* HTML */ ` <fieldset></fieldset> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <fieldset> must have a <legend> as the first child (wcag/h71) at inline:1:3:
			> 1 |  <fieldset></fieldset>
			    |   ^^^^^^^^
			Selector: fieldset"
		`);
	});

	it("should report error when custom element inherits from <fieldset>", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <custom></custom> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <custom> must have a <legend> as the first child (wcag/h71) at inline:1:3:
			> 1 |  <custom></custom>
			    |   ^^^^^^
			Selector: custom"
		`);
	});

	it("should not report when <fieldset> have <legend>", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<fieldset>
				<legend>foo</legend>
			</fieldset>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when <fieldset> have multiple <legend>", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<fieldset>
				<legend>foo</legend>
				<legend>bar</legend>
			</fieldset>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when <fieldset> have out-of-order <legend>", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<fieldset>
				<div>foo</div>
				<legend>bar</legend>
			</fieldset>
		`;
		const report = await htmlvalidate.validateString(markup);
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
