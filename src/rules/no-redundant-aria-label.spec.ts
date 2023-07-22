import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-redundant-aria-label", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-aria-label": "error" },
		});
	});

	it("should not report when input is missing aria-label", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for="foo"> lorem ipsum </label>
			<input id="foo" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when input is missing label", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input aria-label="lorem ipsum" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when label and aria-label have different texts", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for="foo"> lorem ipsum </label>
			<input id="foo" aria-label="foobar" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when <input> have same label and aria-label", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<label for="foo"> lorem ipsum </label>
			<input id="foo" aria-label="lorem ipsum" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: aria-label is redundant when label containing same text exists (no-redundant-aria-label) at inline:3:20:
			  1 |
			  2 | 			<label for="foo"> lorem ipsum </label>
			> 3 | 			<input id="foo" aria-label="lorem ipsum" />
			    | 			                ^^^^^^^^^^
			  4 |
			Selector: #foo"
		`);
	});

	it("should report error when <textarea> have same label and aria-label", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<label for="foo"> lorem ipsum </label>
			<textarea id="foo" aria-label="lorem ipsum"></textarea>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: aria-label is redundant when label containing same text exists (no-redundant-aria-label) at inline:3:23:
			  1 |
			  2 | 			<label for="foo"> lorem ipsum </label>
			> 3 | 			<textarea id="foo" aria-label="lorem ipsum"></textarea>
			    | 			                   ^^^^^^^^^^
			  4 |
			Selector: #foo"
		`);
	});

	it("should report error when <select> have same label and aria-label", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<label for="foo"> lorem ipsum </label>
			<select id="foo" aria-label="lorem ipsum"></select>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: aria-label is redundant when label containing same text exists (no-redundant-aria-label) at inline:3:21:
			  1 |
			  2 | 			<label for="foo"> lorem ipsum </label>
			> 3 | 			<select id="foo" aria-label="lorem ipsum"></select>
			    | 			                 ^^^^^^^^^^
			  4 |
			Selector: #foo"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-aria-label": "error" },
		});
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "no-redundant-aria-label",
		});
		expect(docs).toMatchInlineSnapshot(`
			{
			  "description": "\`aria-label\` is redundant when an associated \`<label>\` element containing the same text exists.",
			  "url": "https://html-validate.org/rules/no-redundant-aria-label.html",
			}
		`);
	});
});
