import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { type RuleContext, Style } from "./void-style";

describe("rule void-style", () => {
	let htmlvalidate: HtmlValidate;

	describe("default", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "void-style": "error" },
			});
		});

		it("should not report when void element omitted end tag", async () => {
			expect.assertions(1);
			const markup = /* RAW */ ` <input> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report when void element is self-closed", async () => {
			expect.assertions(2);
			const markup = /* RAW */ ` <input /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Expected omitted end tag <input> instead of self-closing element <input/> (void-style) at inline:1:9:
				> 1 |  <input />
				    |         ^^
				Selector: input"
			`);
		});

		it("should not report when non-void element has end tag", async () => {
			expect.assertions(1);
			const markup = /* RAW */ ` <div></div> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report when non-void element is self-closed", async () => {
			expect.assertions(1);
			const markup = /* RAW */ ` <div /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report when xml namespaces is used", async () => {
			expect.assertions(1);
			const markup = /* RAW */ ` <xi:include /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe('configured with style="omit"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "void-style": ["error", { style: "omit" }] },
			});
		});

		it("should not report when void element omits end tag", async () => {
			expect.assertions(1);
			const markup = /* RAW */ ` <input> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report when non-void element has end tag", async () => {
			expect.assertions(1);
			const markup = /* RAW */ ` <div></div> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report when void element is self-closed", async () => {
			expect.assertions(2);
			const markup = /* RAW */ ` <input /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Expected omitted end tag <input> instead of self-closing element <input/> (void-style) at inline:1:9:
				> 1 |  <input />
				    |         ^^
				Selector: input"
			`);
		});
	});

	describe('configured with style="selfclose"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "void-style": ["error", { style: "selfclose" }] },
			});
		});

		it("should report when void element omits end tag", async () => {
			expect.assertions(2);
			const markup = /* RAW */ ` <input> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Expected self-closing element <input/> instead of omitted end-tag <input> (void-style) at inline:1:8:
				> 1 |  <input>
				    |        ^
				Selector: input"
			`);
		});

		it("should not report when non-void element has end tag", async () => {
			expect.assertions(1);
			const markup = /* RAW */ ` <div></div> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report when void element is self-closed", async () => {
			expect.assertions(1);
			const markup = /* RAW */ ` <input /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	it("should throw error if configured with invalid value", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "void-style": ["error", { style: "foobar" }] },
		});
		expect(() => htmlvalidate.getConfigForSync("foo")).toThrowErrorMatchingInlineSnapshot(
			`"Rule configuration error: /rules/void-style/1/style must be equal to one of the allowed values: omit, selfclose, selfclosing"`,
		);
	});

	describe("should have contextual documentation", () => {
		it("omit", async () => {
			expect.assertions(2);
			const context: RuleContext = {
				style: Style.AlwaysOmit,
				tagName: "foo",
			};
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "void-style",
				context,
			});
			expect(docs?.description).toMatchInlineSnapshot(
				`"The current configuration requires void elements to omit end tag, use <foo> instead."`,
			);
			expect(docs?.url).toMatchInlineSnapshot(`"https://html-validate.org/rules/void-style.html"`);
		});

		it("self-close", async () => {
			expect.assertions(2);
			const htmlvalidate = new HtmlValidate({
				rules: { "void-style": "error" },
			});
			const context: RuleContext = {
				style: Style.AlwaysSelfclose,
				tagName: "bar",
			};
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "void-style",
				context,
			});
			expect(docs?.description).toMatchInlineSnapshot(
				`"The current configuration requires void elements to be self-closed, use <bar/> instead."`,
			);
			expect(docs?.url).toMatchInlineSnapshot(`"https://html-validate.org/rules/void-style.html"`);
		});
	});
});
