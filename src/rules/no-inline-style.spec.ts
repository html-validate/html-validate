import { beforeAll, describe, expect, it } from "@jest/globals";
import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule no-inline-style", () => {
	let htmlvalidate: HtmlValidate;

	describe("default configuration", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": "error" },
			});
		});

		it("should not report when style attribute sets display property", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p style="display: none"></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report when style attribute is used", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <p style="color: red; background: green"></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Inline style is not allowed (no-inline-style)
				> 1 |  <p style="color: red; background: green"></p>
				    |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
				Selector: p"
			`);
		});

		it("should report when dynamic style attribute is used", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <p dynamic-style=""></p> `;
			const report = await htmlvalidate.validateString(markup, {
				processAttribute,
			});
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Inline style is not allowed (no-inline-style)
				> 1 |  <p dynamic-style=""></p>
				    |     ^^^^^^^^^^^^^^^^
				Selector: p"
			`);
		});

		it("should handle leading whitespace", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <p style=" color: red"></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Inline style is not allowed (no-inline-style)
				> 1 |  <p style=" color: red"></p>
				    |     ^^^^^^^^^^^^^^^^^^^
				Selector: p"
			`);
		});

		it("should handle trailing whitespace", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <p style="color: red; "></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Inline style is not allowed (no-inline-style)
				> 1 |  <p style="color: red; "></p>
				    |     ^^^^^^^^^^^^^^^^^^^^
				Selector: p"
			`);
		});

		it("should handle only whitespace", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <p style=" "></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Inline style is not allowed (no-inline-style)
				> 1 |  <p style=" "></p>
				    |     ^^^^^^^^^
				Selector: p"
			`);
		});
	});

	describe("configured with include", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { include: ["style"] }] },
			});
		});

		it("should report when style attribute is used", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <p style=""></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Inline style is not allowed (no-inline-style)
				> 1 |  <p style=""></p>
				    |     ^^^^^^^^
				Selector: p"
			`);
		});

		it("should not report when dynamic style attribute is used", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p dynamic-style=""></p> `;
			const report = await htmlvalidate.validateString(markup, {
				processAttribute,
			});
			expect(report).toBeValid();
		});
	});

	describe("configured with exclude", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { exclude: ["style"] }] },
			});
		});

		it("should not report when style attribute is used", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p style=""></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report when dynamic style attribute is used", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <p dynamic-style=""></p> `;
			const report = await htmlvalidate.validateString(markup, {
				processAttribute,
			});
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Inline style is not allowed (no-inline-style)
				> 1 |  <p dynamic-style=""></p>
				    |     ^^^^^^^^^^^^^^^^
				Selector: p"
			`);
		});
	});

	describe("allowedProperties", () => {
		it("should not report when style attribute contains only allowed properties", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: {
					"no-inline-style": [
						"error",
						{ allowedProperties: ["color", "background"], allowVariables: false },
					],
				},
			});
			const markup = /* HTML */ ` <p style="color: red; background: green;"></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report when one or more properties are now allowed", async () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: {
					"no-inline-style": ["error", { allowedProperties: ["color"], allowVariables: false }],
				},
			});
			const markup = /* HTML */ ` <p style="color: red; background: green;"></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Inline style is not allowed (no-inline-style)
				> 1 |  <p style="color: red; background: green;"></p>
				    |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
				Selector: p"
			`);
		});

		it("should handle when allowed properties is empty", async () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: [], allowVariables: false }] },
			});
			const markup = /* HTML */ ` <p style="color: red; background: green;"></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Inline style is not allowed (no-inline-style)
				> 1 |  <p style="color: red; background: green;"></p>
				    |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
				Selector: p"
			`);
		});

		it("should handle missing value", async () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: {
					"no-inline-style": ["error", { allowedProperties: ["color"], allowVariables: false }],
				},
			});
			const markup = /* HTML */ ` <p style></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Inline style is not allowed (no-inline-style)
				> 1 |  <p style></p>
				    |     ^^^^^
				Selector: p"
			`);
		});

		it("should handle empty value", async () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: {
					"no-inline-style": ["error", { allowedProperties: ["color"], allowVariables: false }],
				},
			});
			const markup = /* HTML */ ` <p style=""></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Inline style is not allowed (no-inline-style)
				> 1 |  <p style=""></p>
				    |     ^^^^^^^^
				Selector: p"
			`);
		});

		it("should handle malformed declaration", async () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: {
					"no-inline-style": [
						"error",
						{ allowedProperties: ["background"], allowVariables: false },
					],
				},
			});
			const markup = /* HTML */ ` <p style="color"></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Inline style is not allowed (no-inline-style)
				> 1 |  <p style="color"></p>
				    |     ^^^^^^^^^^^^^
				Selector: p"
			`);
		});

		it("should handle trailing semicolon", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: ["color"] }] },
			});
			const markup = /* HTML */ ` <p style="color: red;"></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("allowVariables", () => {
		it("when enabled, should not report when style attribute sets only CSS variables", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: [], allowVariables: true }] },
			});
			const markup = /* HTML */ ` <p style="--my-color: red; --other: 1px"></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("when disabled, should report when style attribute sets CSS variables", async () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: [], allowVariables: false }] },
			});
			const markup = /* HTML */ ` <p style="--my-color: red"></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Inline style is not allowed (no-inline-style)
				> 1 |  <p style="--my-color: red"></p>
				    |     ^^^^^^^^^^^^^^^^^^^^^^^
				Selector: p"
			`);
		});

		it("should report when style attribute sets regular properties alongside CSS variables", async () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: [], allowVariables: true }] },
			});
			const markup = /* HTML */ ` <p style="--my-color: red; color: red"></p> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Inline style is not allowed (no-inline-style)
				> 1 |  <p style="--my-color: red; color: red"></p>
				    |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
				Selector: p"
			`);
		});
	});

	it("smoketest", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-inline-style": "error" },
		});
		const report = await htmlvalidate.validateFile("test-files/rules/no-inline-style.html");
		expect(report).toMatchInlineCodeframe(`
			"error: Inline style is not allowed (no-inline-style)
			> 1 | <p style="color: red"></p>
			    |    ^^^^^^^^^^^^^^^^^^
			  2 | <p></p>
			  3 |
			Selector: p:nth-child(1)"
		`);
	});

	describe("should contain contextual documentation", () => {
		it("with no options enabled", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: [], allowVariables: false }] },
			});
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "no-inline-style",
			});
			expect(docs?.description).toMatchInlineSnapshot(`
				"Inline style is not allowed.

				Inline style is a sign of unstructured CSS. Use class or ID with a separate stylesheet.
				"
			`);
		});

		it("with allowedProperties enabled", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: {
					"no-inline-style": ["error", { allowedProperties: ["color"], allowVariables: false }],
				},
			});
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "no-inline-style",
			});
			expect(docs?.description).toMatchInlineSnapshot(`
				"Inline style is not allowed.

				Inline style is a sign of unstructured CSS. Use class or ID with a separate stylesheet.

				Under the current configuration the following CSS properties are allowed:

				- \`color\`"
			`);
		});

		it("with allowVariables enabled", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: [], allowVariables: true }] },
			});
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "no-inline-style",
			});
			expect(docs?.description).toMatchInlineSnapshot(`
				"Inline style is not allowed.

				Inline style is a sign of unstructured CSS. Use class or ID with a separate stylesheet.

				Under the current configuration the following CSS properties are allowed:

				- CSS variables (custom properties starting with \`--\`).
				"
			`);
		});

		it("with both options enabled", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: {
					"no-inline-style": ["error", { allowedProperties: ["color"], allowVariables: true }],
				},
			});
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "no-inline-style",
			});
			expect(docs?.description).toMatchInlineSnapshot(`
				"Inline style is not allowed.

				Inline style is a sign of unstructured CSS. Use class or ID with a separate stylesheet.

				Under the current configuration the following CSS properties are allowed:

				- \`color\`
				- CSS variables (custom properties starting with \`--\`).
				"
			`);
		});
	});
});
