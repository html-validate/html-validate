import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import "../jest";

describe("rule no-implicit-input-type", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-implicit-input-type": "error" },
		});
	});

	it("should not report error when <input> have type", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<input type="text" />
			<input type="date" />
			<input type="checkbox" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when <input> have dynamic type", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input dynamic-type="type" /> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should not report error when <input> have omitted or empty", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<input type />
			<input type="" />
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

	it("should report error when <input> is missing type", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <input /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <input> is missing recommended "type" attribute (no-implicit-input-type) at inline:1:3:
			> 1 |  <input />
			    |   ^^^^^
			Selector: input"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const context = undefined;
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "no-implicit-input-type",
			context,
		});
		expect(docs).toMatchInlineSnapshot(`
			{
			  "description": "\`<input>\` is missing recommended \`type\` attribute",
			  "url": "https://html-validate.org/rules/no-implicit-input-type.html",
			}
		`);
	});
});
