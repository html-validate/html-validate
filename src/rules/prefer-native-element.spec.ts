import HtmlValidate from "../htmlvalidate";
import "../matchers";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule prefer-native-element", () => {
	describe("default config", () => {
		let htmlvalidate: HtmlValidate;

		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "prefer-native-element": "error" },
			});
		});

		it("should not report error when using role without native equivalent element", () => {
			const report = htmlvalidate.validateString('<div role="unknown"></div>');
			expect(report).toBeValid();
		});

		it("should not report error when role is boolean", () => {
			const report = htmlvalidate.validateString("<div role></div>");
			expect(report).toBeValid();
		});

		it("should not report error for dynamic attributes", () => {
			const report = htmlvalidate.validateString(
				'<input dynamic-role="main">',
				null,
				{
					processAttribute,
				}
			);
			expect(report).toBeValid();
		});

		it("should report error when using role with native equivalent element", () => {
			const report = htmlvalidate.validateString('<div role="main"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"prefer-native-element",
				"Prefer to use the native <main> element"
			);
		});

		it("should handle unquoted role", () => {
			const report = htmlvalidate.validateString("<div role=main></div>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"prefer-native-element",
				"Prefer to use the native <main> element"
			);
		});

		it("smoketest", () => {
			const report = htmlvalidate.validateFile(
				"test-files/rules/prefer-native-element.html"
			);
			expect(report.results).toMatchSnapshot();
		});
	});

	it("should not report error when role is excluded", () => {
		const htmlvalidate = new HtmlValidate({
			rules: { "prefer-native-element": ["error", { exclude: ["main"] }] },
		});
		const valid = htmlvalidate.validateString('<div role="main"></div>');
		const invalid = htmlvalidate.validateString('<div role="article"></div>');
		expect(valid).toBeValid();
		expect(invalid).toBeInvalid();
	});

	it("should report error only for included roles", () => {
		const htmlvalidate = new HtmlValidate({
			rules: { "prefer-native-element": ["error", { include: ["main"] }] },
		});
		const valid = htmlvalidate.validateString('<div role="article"></div>');
		const invalid = htmlvalidate.validateString('<div role="main"></div>');
		expect(valid).toBeValid();
		expect(invalid).toBeInvalid();
	});

	it("should contain documentation", () => {
		const htmlvalidate = new HtmlValidate({
			rules: { "prefer-native-element": "error" },
		});
		expect(
			htmlvalidate.getRuleDocumentation("prefer-native-element")
		).toMatchSnapshot();
	});

	it("should contain contextual documentation", () => {
		const htmlvalidate = new HtmlValidate({
			rules: { "prefer-native-element": "error" },
		});
		const context = {
			role: "the-role",
			replacement: "the-replacement",
		};
		expect(
			htmlvalidate.getRuleDocumentation("prefer-native-element", null, context)
		).toMatchSnapshot();
	});
});
