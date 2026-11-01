import { beforeAll, describe, expect, it } from "@jest/globals";
import "html-validate/jest";
import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import { type RuleContext } from "./presentation-role-style";

expect.addSnapshotSerializer({
	test() {
		return true;
	},
	serialize(value) {
		return String(value);
	},
});

describe("rule presentation-role-style", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "presentation-role-style": "error" },
		});
	});

	it("should not report error for role none", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <img role="none" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for other roles", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<img />
			<img role="generic" />
			<div role="button"></div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when role is boolean", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div role></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for dynamic attributes", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <img dynamic-role="presentation" /> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should not report error for aliased attribute", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString(`<img x-role>`, {
			*processAttribute(attr) {
				yield attr.key === "x-role" ? { ...attr, key: "role", value: "presentation" } : attr;
			},
		});
		expect(report).toBeValid();
	});

	it("should report error for role presentation", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <img role="presentation" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			error: Prefer to use role="none" instead of role="presentation" (presentation-role-style)
			> 1 |  <img role="presentation" />
			    |             ^^^^^^^^^^^^
			Selector: img
		`);
	});

	it.each(['"', "'", ""])("should fix role presentation to none (quote: %j)", async (quote) => {
		expect.assertions(1);
		const markup = `<img role=${quote}presentation${quote}>`;
		const report = await htmlvalidate.validateString(markup);
		const [message] = report.results[0].messages;
		const result = await htmlvalidate.autofix(message.fix!);
		expect(result).toBe(`<img role=${quote}none${quote}>`);
	});

	describe("role token list", () => {
		it("should match role tokens case-insensitively", async () => {
			expect.assertions(3);
			const markup = `<img role="Presentation">`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			const [message] = report.results[0].messages;
			expect(message.message).toBe(`Prefer to use role="none" instead of role="presentation"`);
			const result = await htmlvalidate.autofix(message.fix!);
			expect(result).toBe(`<img role="none">`);
		});

		it("should replace the whole value case-insensitively when both synonyms are used", async () => {
			expect.assertions(2);
			const markup = `<img role="NONE Presentation">`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			const [message] = report.results[0].messages;
			const result = await htmlvalidate.autofix(message.fix!);
			expect(result).toBe(`<img role="none">`);
		});

		it("should report and fix the first synonym in a list of roles", async () => {
			expect.assertions(3);
			const markup = `<img role="presentation button">`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
			error: Prefer to use role="none" instead of role="presentation" (presentation-role-style)
			> 1 | <img role="presentation button">
			    |            ^^^^^^^^^^^^
			Selector: img
		`);
			const [message] = report.results[0].messages;
			const result = await htmlvalidate.autofix(message.fix!);
			expect(result).toBe(`<img role="none button">`);
		});

		it("should report the synonym when it is not the first token", async () => {
			expect.assertions(3);
			const markup = `<img role="  button   presentation">`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
			error: Prefer to use role="none" instead of role="presentation" (presentation-role-style)
			> 1 | <img role="  button   presentation">
			    |                       ^^^^^^^^^^^^
			Selector: img
		`);
			const [message] = report.results[0].messages;
			const result = await htmlvalidate.autofix(message.fix!);
			expect(result).toBe(`<img role="  button   none">`);
		});

		it("should report the discouraged synonym when the preferred is also present", async () => {
			expect.assertions(3);
			const markup = `<img role="none presentation button">`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
			error: Prefer to use role="none" instead of role="presentation" (presentation-role-style)
			> 1 | <img role="none presentation button">
			    |                 ^^^^^^^^^^^^
			Selector: img
		`);
			const [message] = report.results[0].messages;
			const result = await htmlvalidate.autofix(message.fix!);
			expect(result).toBe(`<img role="none none button">`);
		});

		it.each(["none presentation", "presentation none", "  presentation   none presentation "])(
			"should report and replace the whole value when both synonyms are used (%j)",
			async (value) => {
				expect.assertions(3);
				const markup = `<img role="${value}">`;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeInvalid();
				const [message] = report.results[0].messages;
				expect(message.message).toBe(`Prefer to use role="none" instead of role="presentation"`);
				const result = await htmlvalidate.autofix(message.fix!);
				expect(result).toBe(`<img role="none">`);
			},
		);
	});

	describe("configured with prefer none", () => {
		it("should report error for role presentation", async () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				rules: { "presentation-role-style": ["error", { prefer: "none" }] },
			});
			const markup = /* HTML */ `
				<!-- should yield error -->
				<img role="presentation" />

				<!-- should be ok -->
				<img role="none" />
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toMatchInlineCodeframe(`
				error: Prefer to use role="none" instead of role="presentation" (presentation-role-style)
				  1 |
				  2 | 				<!-- should yield error -->
				> 3 | 				<img role="presentation" />
				    | 				           ^^^^^^^^^^^^
				  4 |
				  5 | 				<!-- should be ok -->
				  6 | 				<img role="none" />
				Selector: img:nth-child(1)
			`);
		});
	});

	describe("configured with prefer presentation", () => {
		it("should report error for role none", async () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				rules: { "presentation-role-style": ["error", { prefer: "presentation" }] },
			});
			const markup = /* HTML */ `
				<!-- should be ok -->
				<img role="presentation" />

				<!-- should yield error -->
				<img role="none" />
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toMatchInlineCodeframe(`
				error: Prefer to use role="presentation" instead of role="none" (presentation-role-style)
				  4 |
				  5 | 				<!-- should yield error -->
				> 6 | 				<img role="none" />
				    | 				           ^^^^
				  7 |
				Selector: img:nth-child(2)
			`);
		});
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const context: RuleContext = {
			used: "presentation",
			prefer: "none",
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "presentation-role-style",
			context,
		});
		expect(docs?.description).toMatchInlineSnapshot(`
			Prefer to use \`role="none"\` instead of \`role="presentation"\`.

			\`role="presentation"\` is a synonym for \`role="none"\`.
			The current configuration requires \`role="none"\` to be used.
		`);
	});
});
