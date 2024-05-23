import { HtmlValidate } from "../../htmlvalidate";
import "../../jest";

describe("wcag/h36", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h36": "error" },
		});
	});

	it("should not report when image has alt text", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input type="image" alt="submit" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when image or parent is hidden", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<input type="image" hidden />
			<input type="image" inert />
			<input type="image" aria-hidden="true" />
			<input type="image" style="display: none" />

			<form hidden><input type="image" /></form>
			<form inert><input type="image" /></form>
			<form aria-hidden="true"><input type="image" /></form>
			<form style="display: none"><input type="image" /></form>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report on other input fields", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input type="text" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report on other elements", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p type="image"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when image is missing alt attribute", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <input type="image" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: image used as submit button must have non-empty alt text (wcag/h36) at inline:1:3:
			> 1 |  <input type="image" />
			    |   ^^^^^
			Selector: input"
		`);
	});

	it("should report error when image has empty alt text", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <input type="image" alt="" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: image used as submit button must have non-empty alt text (wcag/h36) at inline:1:22:
			> 1 |  <input type="image" alt="" />
			    |                      ^^^
			Selector: input"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h36": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("wcag/h36");
		expect(docs).toMatchSnapshot();
	});
});
