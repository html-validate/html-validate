import { HtmlValidate } from "../htmlvalidate";
import "../jest";
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

		it("should report error when using role with native equivalent element", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <div role="main"></div> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Prefer to use the native <main> element (prefer-native-element) at inline:1:7:
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
				"error: Prefer to use the native <main> element (prefer-native-element) at inline:1:7:
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
			replacement: "the-replacement",
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "prefer-native-element",
			context,
		});
		expect(docs).toMatchInlineSnapshot(`
			{
			  "description": "Instead of using the WAI-ARIA role "the-role" prefer to use the native <the-replacement> element.",
			  "url": "https://html-validate.org/rules/prefer-native-element.html",
			}
		`);
	});
});
