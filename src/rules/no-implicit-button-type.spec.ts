import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import "../jest";

describe("rule no-implicit-button-type", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-implicit-button-type": "error" },
		});
	});

	it("should not report error when <button> have type", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<button type="button"></button>
			<button type="submit"></button>
			<button type="reset"></button>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when <button> have dynamic type", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <button dynamic-type="type"></button> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should not report error when <button> have omitted or empty", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<button type></button>
			<button type=""></button>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for other elements", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when <button> is a child of <select>", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<select>
				<button></button>
			</select>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when <button> is missing type", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <button></button> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <button> is missing recommended "type" attribute (no-implicit-button-type) at inline:1:3:
			> 1 |  <button></button>
			    |   ^^^^^^
			Selector: button"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const context = undefined;
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "no-implicit-button-type",
			context,
		});
		expect(docs).toMatchInlineSnapshot(`
			{
			  "description": "\`<button>\` is missing recommended \`type\` attribute

			When the \`type\` attribute is omitted it defaults to \`submit\`.
			Submit buttons are triggered when a keyboard user presses <kbd>Enter</kbd>.

			As this may or may not be inteded this rule enforces that the \`type\` attribute be explicitly set to one of the valid types:

			- \`button\` - a generic button.
			- \`submit\` - a submit button.
			- \`reset\`- a button to reset form fields.",
			  "url": "https://html-validate.org/rules/no-implicit-button-type.html",
			}
		`);
	});
});
