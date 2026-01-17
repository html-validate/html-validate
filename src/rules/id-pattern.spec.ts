import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";
import { type BasePatternRuleContext } from "./base-pattern-rule";

describe("rule id-pattern", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "id-pattern": "error" },
		});
	});

	it("should not report error when id follows pattern", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p id="foo-bar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when id matches any configured pattern", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "id-pattern": ["error", { pattern: ["camelcase", "underscore"] }] },
		});
		const markup = /* HTML */ `
			<p id="fooBar"></p>
			<p id="foo_bar"></p>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when id is interpolated", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p id="{{ interpolated }}"></p> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report error when id does not follow pattern", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <p id="fooBar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: id "fooBar" does not match the configured pattern "kebabcase" (id-pattern) at inline:1:9:
			> 1 |  <p id="fooBar"></p>
			    |         ^^^^^^
			Selector: #fooBar"
		`);
	});

	it("should report error when id doesn't match any configured pattern", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "id-pattern": ["error", { pattern: ["camelcase", "underscore", "/^spam-/"] }] },
		});
		const markup = /* HTML */ ` <p id="foo-bar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: id "foo-bar" does not match either of the configured patterns: "camelcase", "underscore" or "/^spam-/" (id-pattern) at inline:1:9:
			> 1 |  <p id="foo-bar"></p>
			    |         ^^^^^^^
			Selector: #foo-bar"
		`);
	});

	it("should report error when id is empty string", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <p id=""></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: id "" does not match the configured pattern "kebabcase" (id-pattern) at inline:1:5:
			> 1 |  <p id=""></p>
			    |     ^^^^^
			Selector: p"
		`);
	});

	it("should not report error when id is omitted", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p id></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should ignore other attributes", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p spam="fooBar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/id-pattern.html");
		expect(report).toMatchInlineCodeframe(`
			"error: id "foo_bar" does not match the configured pattern "kebabcase" (id-pattern) at test-files/rules/id-pattern.html:3:10:
			  1 | <div id="foo-bar"></div>
			  2 |
			> 3 | <div id="foo_bar"></div>
			    |          ^^^^^^^
			  4 |
			  5 | <div id="fooBar"></div>
			  6 |
			Selector: #foo_bar
			error: id "fooBar" does not match the configured pattern "kebabcase" (id-pattern) at test-files/rules/id-pattern.html:5:10:
			  3 | <div id="foo_bar"></div>
			  4 |
			> 5 | <div id="fooBar"></div>
			    |          ^^^^^^
			  6 |
			Selector: #fooBar"
		`);
	});

	it("should contain documentation (single pattern)", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "id-pattern": ["error", { pattern: "underscore" }] },
		});
		const context: BasePatternRuleContext = {
			value: "foo-bar",
		};
		const docs = await htmlvalidate.getContextualDocumentation({ ruleId: "id-pattern", context });
		expect(docs?.description).toMatchInlineSnapshot(`
			"The \`id\` attribute value \`"foo-bar"\` does not match the configured pattern.
			For consistency within the codebase the \`\${attr}\` is required to match one or more of the following patterns:

			- \`underscore\`"
		`);
		expect(docs?.url).toMatchInlineSnapshot(`"https://html-validate.org/rules/id-pattern.html"`);
	});

	it("should contain documentation (multiple pattern)", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "id-pattern": ["error", { pattern: ["camelcase", "underscore"] }] },
		});
		const context: BasePatternRuleContext = {
			value: "foo-bar",
		};
		const docs = await htmlvalidate.getContextualDocumentation({ ruleId: "id-pattern", context });
		expect(docs?.description).toMatchInlineSnapshot(`
			"The \`id\` attribute value \`"foo-bar"\` does not match either of the configured patterns.
			For consistency within the codebase the \`\${attr}\` is required to match one or more of the following patterns:

			- \`camelcase\`
			- \`underscore\`"
		`);
		expect(docs?.url).toMatchInlineSnapshot(`"https://html-validate.org/rules/id-pattern.html"`);
	});
});
