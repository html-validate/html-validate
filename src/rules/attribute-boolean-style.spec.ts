import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule attribute-boolean-style", () => {
	let htmlvalidate: HtmlValidate;

	it("should not report for non-boolean attributes", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "attribute-boolean-style": ["error", { style: "omit" }] },
		});
		const report = htmlvalidate.validateString('<input type="foo">');
		expect(report).toBeValid();
	});

	it("should not report for empty attributes", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "attribute-boolean-style": ["error", { style: "omit" }] },
		});
		const report = htmlvalidate.validateString('<a download=""></a>');
		expect(report).toBeValid();
	});

	it("should not report for unknown elements", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "attribute-boolean-style": ["error", { style: "omit" }] },
		});
		const markup = "<missing-meta></missing-meta>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	describe('configured with "omit"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attribute-boolean-style": ["error", { style: "omit" }] },
			});
		});

		it("should not report error when value is omitted", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<input required>");
			expect(report).toBeValid();
		});

		it("should not report error for non-boolean attributes", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<input type="text">');
			expect(report).toBeValid();
		});

		it("should report error when value is empty string", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<input required="">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" should omit value',
			);
		});

		it("should report error when value is attribute name", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<input required="required">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" should omit value',
			);
		});

		it("should report error when attribute is interpolated", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<input required="{{ dynamic }}">', {
				processAttribute,
			});
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" should omit value',
			);
		});

		it("should not report error when attribute is dynamic", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<input dynamic-required="dynamic">', {
				processAttribute,
			});
			expect(report).toBeValid();
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/attribute-boolean-style.html");
			expect(report).toMatchInlineCodeframe(`
				"error: Attribute "disabled" should omit value (attribute-boolean-style) at test-files/rules/attribute-boolean-style.html:2:8:
				  1 | <input disabled>
				> 2 | <input disabled="">
				    |        ^^^^^^^^
				  3 | <input disabled="required">
				  4 | <input disabled="foobar">
				  5 |
				Selector: input:nth-child(2)
				error: Attribute "disabled" should omit value (attribute-boolean-style) at test-files/rules/attribute-boolean-style.html:3:8:
				  1 | <input disabled>
				  2 | <input disabled="">
				> 3 | <input disabled="required">
				    |        ^^^^^^^^
				  4 | <input disabled="foobar">
				  5 |
				Selector: input:nth-child(3)
				error: Attribute "disabled" should omit value (attribute-boolean-style) at test-files/rules/attribute-boolean-style.html:4:8:
				  2 | <input disabled="">
				  3 | <input disabled="required">
				> 4 | <input disabled="foobar">
				    |        ^^^^^^^^
				  5 |
				Selector: input:nth-child(4)"
			`);
		});
	});

	describe('configured with "empty"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attribute-boolean-style": ["error", { style: "empty" }] },
			});
		});

		it("should report error when value is omitted", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<input required>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" value should be empty string',
			);
		});

		it("should not report error when value is empty string", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<input required="">');
			expect(report).toBeValid();
		});

		it("should report error when value is attribute name", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<input required="required">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" value should be empty string',
			);
		});

		it("should report error when attribute is dynamic", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<input required="{{ dynamic }}">', {
				processAttribute,
			});
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" value should be empty string',
			);
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/attribute-boolean-style.html");
			expect(report).toMatchInlineCodeframe(`
				"error: Attribute "disabled" value should be empty string (attribute-boolean-style) at test-files/rules/attribute-boolean-style.html:1:8:
				> 1 | <input disabled>
				    |        ^^^^^^^^
				  2 | <input disabled="">
				  3 | <input disabled="required">
				  4 | <input disabled="foobar">
				Selector: input:nth-child(1)
				error: Attribute "disabled" value should be empty string (attribute-boolean-style) at test-files/rules/attribute-boolean-style.html:3:8:
				  1 | <input disabled>
				  2 | <input disabled="">
				> 3 | <input disabled="required">
				    |        ^^^^^^^^
				  4 | <input disabled="foobar">
				  5 |
				Selector: input:nth-child(3)
				error: Attribute "disabled" value should be empty string (attribute-boolean-style) at test-files/rules/attribute-boolean-style.html:4:8:
				  2 | <input disabled="">
				  3 | <input disabled="required">
				> 4 | <input disabled="foobar">
				    |        ^^^^^^^^
				  5 |
				Selector: input:nth-child(4)"
			`);
		});
	});

	describe('configured with "name"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attribute-boolean-style": ["error", { style: "name" }] },
			});
		});

		it("should report error when value is omitted", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<input required>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" should be set to required="required"',
			);
		});

		it("should report error when value is empty string", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<input required="">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" should be set to required="required"',
			);
		});

		it("should not report error when value is attribute name", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<input required="required">');
			expect(report).toBeValid();
		});

		it("should report error when attribute is dynamic", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<input required="{{ dynamic }}">', {
				processAttribute,
			});
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" should be set to required="required"',
			);
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/attribute-boolean-style.html");
			expect(report).toMatchInlineCodeframe(`
				"error: Attribute "disabled" should be set to disabled="disabled" (attribute-boolean-style) at test-files/rules/attribute-boolean-style.html:1:8:
				> 1 | <input disabled>
				    |        ^^^^^^^^
				  2 | <input disabled="">
				  3 | <input disabled="required">
				  4 | <input disabled="foobar">
				Selector: input:nth-child(1)
				error: Attribute "disabled" should be set to disabled="disabled" (attribute-boolean-style) at test-files/rules/attribute-boolean-style.html:2:8:
				  1 | <input disabled>
				> 2 | <input disabled="">
				    |        ^^^^^^^^
				  3 | <input disabled="required">
				  4 | <input disabled="foobar">
				  5 |
				Selector: input:nth-child(2)
				error: Attribute "disabled" should be set to disabled="disabled" (attribute-boolean-style) at test-files/rules/attribute-boolean-style.html:3:8:
				  1 | <input disabled>
				  2 | <input disabled="">
				> 3 | <input disabled="required">
				    |        ^^^^^^^^
				  4 | <input disabled="foobar">
				  5 |
				Selector: input:nth-child(3)
				error: Attribute "disabled" should be set to disabled="disabled" (attribute-boolean-style) at test-files/rules/attribute-boolean-style.html:4:8:
				  2 | <input disabled="">
				  3 | <input disabled="required">
				> 4 | <input disabled="foobar">
				    |        ^^^^^^^^
				  5 |
				Selector: input:nth-child(4)"
			`);
		});
	});

	it("should throw error if configured with invalid value", () => {
		expect.assertions(1);
		expect(() => {
			return new HtmlValidate({
				root: true,
				rules: { "attribute-boolean-style": ["error", { style: "foobar" }] },
			});
		}).toThrowErrorMatchingInlineSnapshot(
			`"Rule configuration error: /rules/attribute-boolean-style/1/style must be equal to one of the allowed values: empty, name, omit"`,
		);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "attribute-boolean-style": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("attribute-boolean-style");
		expect(docs).toMatchSnapshot();
	});
});
