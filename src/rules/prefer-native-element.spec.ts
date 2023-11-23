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

		it("should not report error when using role without native equivalent element", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<div role="unknown"></div>');
			expect(report).toBeValid();
		});

		it("should not report error when role is boolean", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<div role></div>");
			expect(report).toBeValid();
		});

		it("should not report error for dynamic attributes", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<input dynamic-role="main">', {
				processAttribute,
			});
			expect(report).toBeValid();
		});

		it("should not report error when element has redundant role", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<main role="main"></main>');
			expect(report).toBeValid();
		});

		it("should report error when using role with native equivalent element", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<div role="main"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"prefer-native-element",
				"Prefer to use the native <main> element",
			);
		});

		it("should handle unquoted role", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<div role=main></div>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"prefer-native-element",
				"Prefer to use the native <main> element",
			);
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/prefer-native-element.html");
			expect(report).toMatchCodeframe();
		});
	});

	it("should not report error when role is excluded", () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "prefer-native-element": ["error", { exclude: ["main"] }] },
		});
		const valid = htmlvalidate.validateString('<div role="main"></div>');
		const invalid = htmlvalidate.validateString('<div role="article"></div>');
		expect(valid).toBeValid();
		expect(invalid).toBeInvalid();
	});

	it("should report error only for included roles", () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "prefer-native-element": ["error", { include: ["main"] }] },
		});
		const valid = htmlvalidate.validateString('<div role="article"></div>');
		const invalid = htmlvalidate.validateString('<div role="main"></div>');
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
