import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-self-closing", () => {
	let htmlvalidate: HtmlValidate;

	describe("default configuration", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "no-self-closing": "error" },
			});
		});

		it("should not report error when element has end tag", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <div></div> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error for foreign elements", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <svg /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error for xml namespaces", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <xi:include /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error for void", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <input /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when void element has end tag", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <input></input> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when element is self-closed", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <div /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <div> must not be self-closed (no-self-closing) at inline:1:7:
				> 1 |  <div />
				    |       ^^
				Selector: div"
			`);
		});

		it("should report error for unknown elements", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <custom-element /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toMatchInlineCodeframe(`
				"error: <custom-element> must not be self-closed (no-self-closing) at inline:1:18:
				> 1 |  <custom-element />
				    |                  ^^
				Selector: custom-element"
			`);
		});
	});

	describe("ignoreForeign false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "no-self-closing": ["error", { ignoreForeign: false }] },
			});
		});

		it("should report error for foreign elements", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <svg /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <svg> must not be self-closed (no-self-closing) at inline:1:7:
				> 1 |  <svg />
				    |       ^^
				Selector: svg"
			`);
		});
	});

	describe("ignoreXML false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "no-self-closing": ["error", { ignoreXML: false }] },
			});
		});

		it("should report error for elements in xml namespace", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <xi:include /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <xi:include> must not be self-closed (no-self-closing) at inline:1:14:
				> 1 |  <xi:include />
				    |              ^^
				Selector: xi:include"
			`);
		});
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "no-self-closing": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("no-self-closing");
		expect(docs).toMatchSnapshot();
	});

	it("should contain contextual documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "no-self-closing": "error" },
		});
		const context = "div";
		const docs = await htmlvalidate.getRuleDocumentation("no-self-closing", null, context);
		expect(docs).toMatchSnapshot();
	});
});
