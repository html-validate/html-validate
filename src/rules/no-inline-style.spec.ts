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
			const report = await htmlvalidate.validateString('<p style="display: none"></p>');
			expect(report).toBeValid();
		});

		it("should report when style attribute is used", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString(
				'<p style="color: red; background: green"></p>',
			);
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should report when dynamic style attribute is used", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString('<p dynamic-style=""></p>', {
				processAttribute,
			});
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should handle leading whitespace", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString('<p style=" color: red"></p>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should handle trailing whitespace", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString('<p style="color: red; "></p>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should handle only whitespace", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString('<p style=" "></p>');
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

		it("should report when style attribute is used", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString('<p style=""></p>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should not report when dynamic style attribute is used", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString('<p dynamic-style=""></p>', {
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
			const report = await htmlvalidate.validateString('<p style=""></p>');
			expect(report).toBeValid();
		});

		it("should report when dynamic style attribute is used", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString('<p dynamic-style=""></p>', {
				processAttribute,
			});
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});
	});

	describe("allowedProperties", () => {
		it("should not report when style attribute contains only allowed properties", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: ["color", "background"] }] },
			});
			const report = await htmlvalidate.validateString(
				'<p style="color: red; background: green;"></p>',
			);
			expect(report).toBeValid();
		});

		it("should report when one or more properties are now allowed", async () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: ["color"] }] },
			});
			const report = await htmlvalidate.validateString(
				'<p style="color: red; background: green;"></p>',
			);
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should handle when allowed properties is empty", async () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: [] }] },
			});
			const report = await htmlvalidate.validateString(
				'<p style="color: red; background: green;"></p>',
			);
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should handle missing value", async () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: ["color"] }] },
			});
			const report = await htmlvalidate.validateString("<p style></p>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should handle empty value", async () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: ["color"] }] },
			});
			const report = await htmlvalidate.validateString('<p style=""></p>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should handle malformed declaration", async () => {
			expect.assertions(2);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: ["background"] }] },
			});
			const report = await htmlvalidate.validateString('<p style="color"></p>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-inline-style", "Inline style is not allowed");
		});

		it("should handle trailing semicolon", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "no-inline-style": ["error", { allowedProperties: ["color"] }] },
			});
			const report = await htmlvalidate.validateString('<p style="color: red;"></p>');
			expect(report).toBeValid();
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
			"error: Inline style is not allowed (no-inline-style) at test-files/rules/no-inline-style.html:1:4:
			> 1 | <p style="color: red"></p>
			    |    ^^^^^^^^^^^^^^^^^^
			  2 | <p></p>
			  3 |
			Selector: p:nth-child(1)"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-inline-style": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("no-inline-style");
		expect(docs).toMatchSnapshot();
	});
});
