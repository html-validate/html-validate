import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import { type RuleContext } from "./autocomplete-password";
import "../jest";

expect.addSnapshotSerializer({
	test() {
		return true;
	},
	serialize(value) {
		return String(value);
	},
});

describe("rule autocomplete-password", () => {
	let htmlvalidate: HtmlValidate;

	describe("default configuration", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "autocomplete-password": "error" },
			});
		});

		it('should not report error when <input type="password"> has autocomplete attribute', async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<input type="password" autocomplete="new-password" />
				<input type="password" autocomplete="current-password" />
				<input type="password" autocomplete="password" />
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it('should not report error when <input type="password"> has autocomplete with omitted value', async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <input type="password" autocomplete /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when autocomplete is dynamic", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <input type="password" dynamic-autocomplete="autocomplete" /> `;
			const report = await htmlvalidate.validateString(markup, {
				processAttribute,
			});
			expect(report).toBeValid();
		});

		it("should not report error for non-password inputs", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<input type="text" />
				<input type="email" />
				<input />
				<div></div>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it('should report error when <input type="password"> is missing autocomplete attribute', async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <input type="password" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				error: <input type="password"> is missing required "autocomplete" attribute (autocomplete-password) at inline:1:3:
				> 1 |  <input type="password" />
				    |   ^^^^^
				Selector: input
			`);
		});

		it('should report error when <input type="password"> has autocomplete="off"', async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <input type="password" autocomplete="off" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				error: <input type="password"> should not use autocomplete="off" (autocomplete-password) at inline:1:39:
				> 1 |  <input type="password" autocomplete="off" />
				    |                                       ^^^
				Selector: input
			`);
		});

		it("should handle case-insensitive values", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <input type="password" autocomplete="OFF" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				error: <input type="password"> should not use autocomplete="off" (autocomplete-password) at inline:1:39:
				> 1 |  <input type="password" autocomplete="OFF" />
				    |                                       ^^^
				Selector: input
			`);
		});

		it("should handle case-insensitive type attribute", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <input type="PASSWORD" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				error: <input type="password"> is missing required "autocomplete" attribute (autocomplete-password) at inline:1:3:
				> 1 |  <input type="PASSWORD" />
				    |   ^^^^^
				Selector: input
			`);
		});
	});

	describe("with preferred option", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "autocomplete-password": ["error", { preferred: "new-password" }] },
			});
		});

		it("should not report error when autocomplete matches preferred value", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <input type="password" autocomplete="new-password" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it('should not report error when <input type="password"> has autocomplete with omitted value', async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <input type="password" autocomplete /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when autocomplete does not match preferred value", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <input type="password" autocomplete="current-password" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				error: <input type="password"> should use autocomplete="new-password" (autocomplete-password) at inline:1:39:
				> 1 |  <input type="password" autocomplete="current-password" />
				    |                                       ^^^^^^^^^^^^^^^^
				Selector: input
			`);
		});

		it('should report error when autocomplete is "off"', async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <input type="password" autocomplete="off" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				error: <input type="password"> should not use autocomplete="off" (autocomplete-password) at inline:1:39:
				> 1 |  <input type="password" autocomplete="off" />
				    |                                       ^^^
				Selector: input
			`);
		});

		it("should report error when autocomplete is missing", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <input type="password" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				error: <input type="password"> is missing required "autocomplete" attribute (autocomplete-password) at inline:1:3:
				> 1 |  <input type="password" />
				    |   ^^^^^
				Selector: input
			`);
		});

		it("should handle case-insensitive preferred value matching", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <input type="password" autocomplete="NEW-PASSWORD" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("with grouping tokens", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "autocomplete-password": ["error", { preferred: "new-password" }] },
			});
		});

		it("should not report error when using section-* grouping with preferred token", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<input type="password" autocomplete="section-test new-password" />
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when using section-* grouping with non-preferred token", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<input type="password" autocomplete="section-test current-password" />
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				error: <input type="password"> should use autocomplete="new-password" (autocomplete-password) at inline:2:55:
				  1 |
				> 2 | 				<input type="password" autocomplete="section-test current-password" />
				    | 				                                                  ^^^^^^^^^^^^^^^^
				  3 |
				Selector: input
			`);
		});

		it("should not report error when using shipping grouping with preferred token", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <input type="password" autocomplete="shipping new-password" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when using shipping grouping with non-preferred token", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<input type="password" autocomplete="shipping current-password" />
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				error: <input type="password"> should use autocomplete="new-password" (autocomplete-password) at inline:2:51:
				  1 |
				> 2 | 				<input type="password" autocomplete="shipping current-password" />
				    | 				                                              ^^^^^^^^^^^^^^^^
				  3 |
				Selector: input
			`);
		});

		it("should not report error when using billing grouping with preferred token", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <input type="password" autocomplete="billing new-password" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when using billing grouping with non-preferred token", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<input type="password" autocomplete="billing current-password" />
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				error: <input type="password"> should use autocomplete="new-password" (autocomplete-password) at inline:2:50:
				  1 |
				> 2 | 				<input type="password" autocomplete="billing current-password" />
				    | 				                                             ^^^^^^^^^^^^^^^^
				  3 |
				Selector: input
			`);
		});

		it("should not report error when only grouping token is present", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<input type="password" autocomplete="section-test" />
				<input type="password" autocomplete="shipping" />
				<input type="password" autocomplete="billing" />
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("documentation", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "autocomplete-password": "error" },
			});
		});

		it("should contain contextual documentation for missing autocomplete", async () => {
			expect.assertions(1);
			const context: RuleContext = { kind: "missing" };
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "autocomplete-password",
				context,
			});
			expect(docs?.description).toMatchInlineSnapshot(`
				\`<input type="password">\` must have the \`autocomplete\` attribute.

				Browsers and password managers often ignore the absence of autocomplete and autofill password fields anyway, which can lead to unexpected behavior where users unknowingly submit autofilled passwords for unrelated fields.

				Use one of the following values:

				- \`autocomplete="new-password"\` for password creation forms
				- \`autocomplete="current-password"\` for login forms
			`);
		});

		it('should contain contextual documentation for autocomplete="off"', async () => {
			expect.assertions(1);
			const context: RuleContext = { kind: "off" };
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "autocomplete-password",
				context,
			});
			expect(docs?.description).toMatchInlineSnapshot(`
				\`<input type="password">\` should not use \`autocomplete="off"\`.

				Browsers and password managers often ignore the absence of autocomplete and autofill password fields anyway, which can lead to unexpected behavior where users unknowingly submit autofilled passwords for unrelated fields.

				Use one of the following values:

				- \`autocomplete="new-password"\` for password creation forms
				- \`autocomplete="current-password"\` for login forms
			`);
		});

		it("should contain contextual documentation for preferred value mismatch", async () => {
			expect.assertions(1);
			const context: RuleContext = {
				kind: "preferred-mismatch",
				value: "current-password",
				preferred: "new-password",
			};
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "autocomplete-password",
				context,
			});
			expect(docs?.description).toMatchInlineSnapshot(`
				\`<input type="password">\` should use \`autocomplete="new-password"\`.

				The configured preferred autocomplete value is \`"new-password"\` but the element uses \`"current-password"\`.
			`);
		});
	});
});
