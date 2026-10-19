import { beforeAll, describe, expect, it } from "@jest/globals";
import { HtmlValidate } from "../htmlvalidate";
import "html-validate/jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule prefer-native-element", () => {
	describe("default config", () => {
		let htmlvalidate: HtmlValidate;

		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "prefer-native-element": "error" },
			});
		});

		it("should not report error when using role without native equivalent element", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <div role="unknown"></div> `;
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
			const markup = /* HTML */ ` <input dynamic-role="main" /> `;
			const report = await htmlvalidate.validateString(markup, {
				processAttribute,
			});
			expect(report).toBeValid();
		});

		it("should not report error when element has redundant role", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <main role="main"></main> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it.each(["ul", "ol", "menu"])(
			"should not report error when <%s> has the implicit role list",
			async (tagName) => {
				expect.assertions(1);
				const markup = /* HTML */ ` <${tagName} role="list"><li>a</li></${tagName}> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			},
		);

		it("should report error when using role list on non-list element", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <div role="list"></div> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Prefer to use the native <ul>, <ol> or <menu> element (prefer-native-element)
				> 1 |  <div role="list"></div>
				    |       ^^^^^^^^^^^
				Selector: div"
			`);
		});

		it.each(["h1", "h2", "h3", "h4", "h5", "h6"])(
			"should not report error when <%s> has role heading",
			async (tagName) => {
				expect.assertions(1);
				const markup = /* HTML */ ` <${tagName} role="heading">a</${tagName}> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			},
		);

		it("should handle implicit role depending on attributes after role", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <area role="link" href="#" alt="foo" /> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when using role with native equivalent element", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <div role="main"></div> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Prefer to use the native <main> element (prefer-native-element)
				> 1 |  <div role="main"></div>
				    |       ^^^^^^^^^^^
				Selector: div"
			`);
		});

		it("should handle unquoted role", async () => {
			expect.assertions(2);
			const markup = /* RAW */ ` <div role=main></div> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Prefer to use the native <main> element (prefer-native-element)
				> 1 |  <div role=main></div>
				    |       ^^^^^^^^^
				Selector: div"
			`);
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("test-files/rules/prefer-native-element.html");
			expect(report).toMatchCodeframe();
		});
	});

	it("should accept array of replacement elements in mapping", async () => {
		expect.assertions(3);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"prefer-native-element": ["error", { mapping: { group: ["fieldset", "details"] } }],
			},
		});
		const valid = await htmlvalidate.validateString('<details role="group"></details>');
		const invalid = await htmlvalidate.validateString('<div role="group"></div>');
		expect(valid).toBeValid();
		expect(invalid).toBeInvalid();
		expect(invalid).toHaveError(
			"prefer-native-element",
			"Prefer to use the native <fieldset> or <details> element",
		);
	});

	it("should not report error when role is excluded", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "prefer-native-element": ["error", { exclude: ["main"] }] },
		});
		const valid = await htmlvalidate.validateString('<div role="main"></div>');
		const invalid = await htmlvalidate.validateString('<div role="article"></div>');
		expect(valid).toBeValid();
		expect(invalid).toBeInvalid();
	});

	it("should report error only for included roles", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "prefer-native-element": ["error", { include: ["main"] }] },
		});
		const valid = await htmlvalidate.validateString('<div role="article"></div>');
		const invalid = await htmlvalidate.validateString('<div role="main"></div>');
		expect(valid).toBeValid();
		expect(invalid).toBeInvalid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "prefer-native-element": "error" },
		});
		const context = {
			role: "the-role",
			replacement: ["ul", "ol", "menu"],
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "prefer-native-element",
			context,
		});
		expect(docs).toMatchInlineSnapshot(`
			{
			  "description": "Instead of using the WAI-ARIA role "the-role" prefer to use the native \`<ul>\`, \`<ol>\` or \`<menu>\` element.",
			  "url": "https://html-validate.org/rules/prefer-native-element.html",
			}
		`);
	});
});
