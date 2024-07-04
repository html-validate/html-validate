import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";
import { type BasePatternRuleContext } from "./base-pattern-rule";

describe("rule name-pattern", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "name-pattern": "error" },
		});
	});

	it("should not report error when name follows pattern", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input name="fooBar" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when name have array brackets", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input name="fooBar[]" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when name matches any configured pattern", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "name-pattern": ["error", { pattern: ["camelcase", "underscore"] }] },
		});
		const markup = /* HTML */ `
			<input name="fooBar" />
			<input name="foo_bar" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when name is interpolated", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input name="{{ interpolated }}" /> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should not report errors on non-form controls", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div name="foo-bar" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when name is omitted", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input name /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when name does not follow pattern", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <input name="foo-bar" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: name "foo-bar" does not match the configured pattern "camelcase" (name-pattern) at inline:1:15:
			> 1 |  <input name="foo-bar" />
			    |               ^^^^^^^
			Selector: input"
		`);
	});

	it("should report error when name with array brackets does not follow pattern", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <input name="foo-bar[]" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: name "foo-bar" does not match the configured pattern "camelcase" (name-pattern) at inline:1:15:
			> 1 |  <input name="foo-bar[]" />
			    |               ^^^^^^^^^
			Selector: input"
		`);
	});

	it("should report error when name doesn't match any configured pattern", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "name-pattern": ["error", { pattern: ["camelcase", "underscore", "^spam-"] }] },
		});
		const markup = /* HTML */ ` <input name="foo-bar" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: name "foo-bar" does not match either of the configured patterns: "camelcase", "underscore" or "/^spam-/" (name-pattern) at inline:1:15:
			> 1 |  <input name="foo-bar" />
			    |               ^^^^^^^
			Selector: input"
		`);
	});

	it("should report error when name is empty string", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <input name="" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: name "" does not match the configured pattern "camelcase" (name-pattern) at inline:1:9:
			> 1 |  <input name="" />
			    |         ^^^^^^^
			Selector: input"
		`);
	});

	it("should ignore other attributes", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input spam="fooBar" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should contain documentation (single pattern)", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "name-pattern": ["error", { pattern: "underscore" }] },
		});
		const context: BasePatternRuleContext = {
			value: "foo-bar",
		};
		const docs = await htmlvalidate.getContextualDocumentation({ ruleId: "name-pattern", context });
		expect(docs?.description).toMatchInlineSnapshot(`
			"The \`name\` attribute value \`"foo-bar"\` does not match the configured pattern.
			For consistency within the codebase the \`\${attr}\` is required to match one or more of the following patterns:

			- \`underscore\`"
		`);
		expect(docs?.url).toMatchInlineSnapshot(`"https://html-validate.org/rules/name-pattern.html"`);
	});

	it("should contain documentation (multiple pattern)", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "name-pattern": ["error", { pattern: ["camelcase", "underscore"] }] },
		});
		const context: BasePatternRuleContext = {
			value: "foo-bar",
		};
		const docs = await htmlvalidate.getContextualDocumentation({ ruleId: "name-pattern", context });
		expect(docs?.description).toMatchInlineSnapshot(`
			"The \`name\` attribute value \`"foo-bar"\` does not match either of the configured patterns.
			For consistency within the codebase the \`\${attr}\` is required to match one or more of the following patterns:

			- \`camelcase\`
			- \`underscore\`"
		`);
		expect(docs?.url).toMatchInlineSnapshot(`"https://html-validate.org/rules/name-pattern.html"`);
	});
});
