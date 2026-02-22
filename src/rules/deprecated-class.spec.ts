import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";
import type { RuleContext } from "./deprecated-class";

describe("rule deprecated-class", () => {
	it("should not report error when no deprecated classes are configured", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "deprecated-class": "error" },
		});
		const markup = /* HTML */ ` <p class="foo bar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when class is not deprecated", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p class="foo bar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when class attribute is missing", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for other attributes", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p data-attr="old-class"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when class attribute has no value", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p class></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when class attribute is empty string", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p class=""></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when class attribute has dynamic value", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p dynamic-class="expr"></p> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report error when deprecated class is used", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p class="old-class"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: class "old-class" is deprecated (deprecated-class) at inline:1:12:
			> 1 |  <p class="old-class"></p>
			    |            ^^^^^^^^^
			Selector: p"
		`);
	});

	it("should report error with custom message when provided", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
								message: "This class causes performance issues",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p class="old-class"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: class "old-class" is deprecated: This class causes performance issues (deprecated-class) at inline:1:12:
			> 1 |  <p class="old-class"></p>
			    |            ^^^^^^^^^
			Selector: p"
		`);
	});

	it("should report error for multiple deprecated classes", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
							},
							{
								class: "legacy-class",
								message: "Use new-class instead",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p class="old-class legacy-class"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: class "old-class" is deprecated (deprecated-class) at inline:1:12:
			> 1 |  <p class="old-class legacy-class"></p>
			    |            ^^^^^^^^^
			Selector: p
			error: class "legacy-class" is deprecated: Use new-class instead (deprecated-class) at inline:1:22:
			> 1 |  <p class="old-class legacy-class"></p>
			    |                      ^^^^^^^^^^^^
			Selector: p"
		`);
	});

	it("should report error only for deprecated class in mixed list", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p class="foo old-class bar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: class "old-class" is deprecated (deprecated-class) at inline:1:16:
			> 1 |  <p class="foo old-class bar"></p>
			    |                ^^^^^^^^^
			Selector: p"
		`);
	});

	it("should report error for multiple elements with deprecated classes", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ `
			<div class="old-class">
				<span class="old-class"></span>
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: class "old-class" is deprecated (deprecated-class) at inline:2:16:
			  1 |
			> 2 | 			<div class="old-class">
			    | 			            ^^^^^^^^^
			  3 | 				<span class="old-class"></span>
			  4 | 			</div>
			  5 |
			Selector: div
			error: class "old-class" is deprecated (deprecated-class) at inline:3:18:
			  1 |
			  2 | 			<div class="old-class">
			> 3 | 				<span class="old-class"></span>
			    | 				             ^^^^^^^^^
			  4 | 			</div>
			  5 |
			Selector: div > span"
		`);
	});

	it("should handle class names with special characters", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "hover:text-red",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p class="hover:text-red"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: class "hover:text-red" is deprecated (deprecated-class) at inline:1:12:
			> 1 |  <p class="hover:text-red"></p>
			    |            ^^^^^^^^^^^^^^
			Selector: p"
		`);
	});

	it("should report error with replacement when provided", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
								replacement: "new-class",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p class="old-class"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: class "old-class" is deprecated and replaced with "new-class" (deprecated-class) at inline:1:12:
			> 1 |  <p class="old-class"></p>
			    |            ^^^^^^^^^
			Selector: p"
		`);
	});

	it("should report error with both replacement and message when provided", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
								replacement: "new-class",
								message: "This class has performance issues",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p class="old-class"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: class "old-class" is deprecated and replaced with "new-class": This class has performance issues (deprecated-class) at inline:1:12:
			> 1 |  <p class="old-class"></p>
			    |            ^^^^^^^^^
			Selector: p"
		`);
	});

	it("should report error with array replacement when provided", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
								replacement: ["new-class", "alternative-class"],
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p class="old-class"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: class "old-class" is deprecated and replaced with "new-class" or "alternative-class" (deprecated-class) at inline:1:12:
			> 1 |  <p class="old-class"></p>
			    |            ^^^^^^^^^
			Selector: p"
		`);
	});

	it("should be case-sensitive", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p class="Old-Class"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error for each occurrence of repeated classname", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p class="old-class old-class"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: class "old-class" is deprecated (deprecated-class) at inline:1:12:
			> 1 |  <p class="old-class old-class"></p>
			    |            ^^^^^^^^^
			Selector: p
			error: class "old-class" is deprecated (deprecated-class) at inline:1:22:
			> 1 |  <p class="old-class old-class"></p>
			    |                      ^^^^^^^^^
			Selector: p"
		`);
	});

	it("should report error for repeated class attributes", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
							},
						],
					},
				],
			},
		});
		const markup = /* HTML */ ` <p class="old-class" class="old-class"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: class "old-class" is deprecated (deprecated-class) at inline:1:12:
			> 1 |  <p class="old-class" class="old-class"></p>
			    |            ^^^^^^^^^
			Selector: p
			error: class "old-class" is deprecated (deprecated-class) at inline:1:30:
			> 1 |  <p class="old-class" class="old-class"></p>
			    |                              ^^^^^^^^^
			Selector: p"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
								message: "This class is obsolete",
								replacement: "new-class",
								url: "https://example.com/migration-guide",
							},
						],
					},
				],
			},
		});
		const context: RuleContext = {
			class: "old-class",
			message: "This class is obsolete",
			replacement: ["new-class"],
			url: "https://example.com/migration-guide",
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "deprecated-class",
			context,
		});
		expect(docs?.description).toMatchInlineSnapshot(`
			"The class \`old-class\` is deprecated and should not be used: This class is obsolete.

			Use the replacement class \`new-class\` instead.

			For details see: https://example.com/migration-guide"
		`);
	});

	it("should contain documentation without optional fields", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
							},
						],
					},
				],
			},
		});
		const context: RuleContext = {
			class: "old-class",
			message: null,
			replacement: [],
			url: null,
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "deprecated-class",
			context,
		});
		expect(docs?.description).toMatchInlineSnapshot(
			`"The class \`old-class\` is deprecated and should not be used."`,
		);
	});

	it("should contain documentation with array replacement", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
								replacement: ["new-class", "alternative-class"],
							},
						],
					},
				],
			},
		});
		const context: RuleContext = {
			class: "old-class",
			message: null,
			replacement: ["new-class", "alternative-class"],
			url: null,
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "deprecated-class",
			context,
		});
		expect(docs?.description).toMatchInlineSnapshot(`
			"The class \`old-class\` is deprecated and should not be used.

			Use one of the following replacement classes instead:
			- \`new-class\`
			- \`alternative-class\`"
		`);
	});

	it("should contain documentation with only url", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"deprecated-class": [
					"error",
					{
						classes: [
							{
								class: "old-class",
								url: "https://example.com/docs",
							},
						],
					},
				],
			},
		});
		const context: RuleContext = {
			class: "old-class",
			message: null,
			replacement: [],
			url: "https://example.com/docs",
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "deprecated-class",
			context,
		});
		expect(docs?.description).toMatchInlineSnapshot(`
			"The class \`old-class\` is deprecated and should not be used.

			For details see: https://example.com/docs"
		`);
	});
});
