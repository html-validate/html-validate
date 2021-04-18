import HtmlValidate from "../htmlvalidate";
import "../matchers";
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

		it("should not report when style attribute sets display property", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<p style="display: none"></p>');
			expect(report).toBeValid();
		});

		it("should report when style attribute is used", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<p style="color: red; background: green"></p>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should report when dynamic style attribute is used", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<p dynamic-style=""></p>', {
				processAttribute,
			});
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});
	});

	describe("configured with include", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { include: ["style"] }] },
			});
		});

		it("should report when style attribute is used", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<p style=""></p>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should not report when dynamic style attribute is used", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<p dynamic-style=""></p>', {
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

		it("should not report when style attribute is used", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<p style=""></p>');
			expect(report).toBeValid();
		});

		it("should report when dynamic style attribute is used", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<p dynamic-style=""></p>', {
				processAttribute,
			});
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});
	});

	describe("allowedProperties", () => {
		it("should not report when style attribute contains only allowed properties", () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: ["color", "background"] }] },
			});
			const report = htmlvalidate.validateString('<p style="color: red; background: green;"></p>');
			expect(report).toBeValid();
		});

		it("should report when one or more properties are now allowed", () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: ["color"] }] },
			});
			const report = htmlvalidate.validateString('<p style="color: red; background: green;"></p>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should handle when allowed properties is empty", () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: [] }] },
			});
			const report = htmlvalidate.validateString('<p style="color: red; background: green;"></p>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should handle missing value", () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: ["color"] }] },
			});
			const report = htmlvalidate.validateString("<p style></p>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should handle empty value", () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: ["color"] }] },
			});
			const report = htmlvalidate.validateString('<p style=""></p>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should handle malformed declaration", () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: [] }] },
			});
			const report = htmlvalidate.validateString('<p style="color"></p>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should handle trailing semicolon", () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: ["color"] }] },
			});
			const report = htmlvalidate.validateString('<p style="color: red;"></p>');
			expect(report).toBeValid();
		});
	});

	it("smoketest", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-inline-style": "error" },
		});
		const report = htmlvalidate.validateFile("test-files/rules/no-inline-style.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-inline-style": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("no-inline-style")).toMatchSnapshot();
	});
});
