import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { type BasePatternRuleContext } from "./base-pattern-rule";

describe("rule class-pattern", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "class-pattern": "error" },
		});
	});

	it("should not report error when class follows pattern", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p class="foo-bar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when class matches any configured pattern", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "class-pattern": ["error", { pattern: ["camelcase", "underscore"] }] },
		});
		const markup = /* HTML */ ` <p class="fooBar foo_bar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when class does not follow pattern", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <p class="foo-bar fooBar spam"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: class "fooBar" does not match the configured pattern "kebabcase" (class-pattern) at inline:1:20:
			> 1 |  <p class="foo-bar fooBar spam"></p>
			    |                    ^^^^^^
			Selector: p"
		`);
	});

	it("should report error when class doesn't match any configured pattern", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "class-pattern": ["error", { pattern: ["camelcase", "underscore", "^spam-"] }] },
		});
		const markup = /* HTML */ ` <p class="foo-bar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: class "foo-bar" does not match either of the configured patterns: "camelcase", "underscore" or "/^spam-/" (class-pattern) at inline:1:12:
			> 1 |  <p class="foo-bar"></p>
			    |            ^^^^^^^
			Selector: p"
		`);
	});

	it("should ignore other attributes", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p spam="fooBar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/class-pattern.html");
		expect(report).toMatchInlineCodeframe(`
			"error: class "foo_bar" does not match the configured pattern "kebabcase" (class-pattern) at test-files/rules/class-pattern.html:3:17:
			  1 | <div class="foo foo-bar bar"></div>
			  2 |
			> 3 | <div class="foo foo_bar bar"></div>
			    |                 ^^^^^^^
			  4 |
			  5 | <div class="foo fooBar bar"></div>
			  6 |
			Selector: div:nth-child(2)
			error: class "fooBar" does not match the configured pattern "kebabcase" (class-pattern) at test-files/rules/class-pattern.html:5:17:
			  3 | <div class="foo foo_bar bar"></div>
			  4 |
			> 5 | <div class="foo fooBar bar"></div>
			    |                 ^^^^^^
			  6 |
			Selector: div:nth-child(3)"
		`);
	});

	it("should contain documentation (single pattern)", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "class-pattern": ["error", { pattern: "underscore" }] },
		});
		const context: BasePatternRuleContext = {
			value: "foo-bar",
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "class-pattern",
			context,
		});
		expect(docs?.description).toMatchInlineSnapshot(`
			"The \`class\` attribute value \`"foo-bar"\` does not match the configured pattern.
			For consistency within the codebase the \`\${attr}\` is required to match one or more of the following patterns:

			- \`underscore\`"
		`);
		expect(docs?.url).toMatchInlineSnapshot(`"https://html-validate.org/rules/class-pattern.html"`);
	});

	it("should contain documentation (multiple pattern)", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "class-pattern": ["error", { pattern: ["camelcase", "underscore"] }] },
		});
		const context: BasePatternRuleContext = {
			value: "foo-bar",
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "class-pattern",
			context,
		});
		expect(docs?.description).toMatchInlineSnapshot(`
			"The \`class\` attribute value \`"foo-bar"\` does not match either of the configured patterns.
			For consistency within the codebase the \`\${attr}\` is required to match one or more of the following patterns:

			- \`camelcase\`
			- \`underscore\`"
		`);
		expect(docs?.url).toMatchInlineSnapshot(`"https://html-validate.org/rules/class-pattern.html"`);
	});
});
