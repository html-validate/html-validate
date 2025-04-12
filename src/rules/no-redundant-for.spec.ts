import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-redundant-for", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-for": "error" },
		});
	});

	it("should not report when <label> does not have for attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label>
				<input />
			</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when <label> references control elsewhere in tree", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for="foo"> </label>
			<input id="foo" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle omitted value", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <label for> </label> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle empty value", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <label for=""> </label> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle whitespace", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for="a b"> </label>
			<input id="a b" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for other elements", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<custom-element for="foo">
				<input id="foo" />
			</custom-element>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when <label> references wrapped element", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<label for="foo">
				<input id="foo" />
			</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Redundant "for" attribute (no-redundant-for) at inline:2:11:
			  1 |
			> 2 | 			<label for="foo">
			    | 			       ^^^
			  3 | 				<input id="foo" />
			  4 | 			</label>
			  5 |
			Selector: label"
		`);
	});

	it("should handle comma", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<label for="foo,-bar">
				<input id="foo,-bar" />
			</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
		"error: Redundant "for" attribute (no-redundant-for) at inline:2:11:
		  1 |
		> 2 | 			<label for="foo,-bar">
		    | 			       ^^^
		  3 | 				<input id="foo,-bar" />
		  4 | 			</label>
		  5 |
		Selector: label"
	`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const context = undefined;
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "no-redundant-for",
			context,
		});
		expect(docs).toMatchInlineSnapshot(`
			{
			  "description": "When the \`<label>\` element wraps the labelable control the \`for\` attribute is redundant and better left out.",
			  "url": "https://html-validate.org/rules/no-redundant-for.html",
			}
		`);
	});
});
