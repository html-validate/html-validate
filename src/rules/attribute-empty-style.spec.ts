import HtmlValidate from "../htmlvalidate";
import "../matchers";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule attribute-empty-style", () => {
	let htmlvalidate: HtmlValidate;

	it("should not report unknown elements", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "attribute-empty-style": ["error", { style: "omit" }] },
		});
		const report = htmlvalidate.validateString('<custom-element foobar=""></custom-element>');
		expect(report).toBeValid();
	});

	it("should not report unknown attributes", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "attribute-empty-style": ["error", { style: "omit" }] },
		});
		const report = htmlvalidate.validateString('<a foobar=""></a>');
		expect(report).toBeValid();
	});

	describe('configured with "omit"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "attribute-empty-style": ["error", { style: "omit" }] },
			});
		});

		it("should report error when value is empty string", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<a download=""></a>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("attribute-empty-style", 'Attribute "download" should omit value');
		});

		it("should not report error when value is omitted", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<a download></a>");
			expect(report).toBeValid();
		});

		it("should not report error for non-empty attributes", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a download="file.txt"></a>');
			expect(report).toBeValid();
		});

		it("should not report error for boolean attributes", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<input required="">');
			expect(report).toBeValid();
		});

		it("should not report error when attribute is interpolated", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a download="{{ dynamic }}">', {
				processAttribute,
			});
			expect(report).toBeValid();
		});

		it("should not report error when attribute is dynamic", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<input dynamic-required="dynamic">', {
				processAttribute,
			});
			expect(report).toBeValid();
		});
	});

	describe('configured with "empty"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "attribute-empty-style": ["error", { style: "empty" }] },
			});
		});

		it("should report error when value is omitted", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<a download></a>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-empty-style",
				'Attribute "download" value should be empty string'
			);
		});

		it("should not report error when value is empty string", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a download=""></a>');
			expect(report).toBeValid();
		});

		it("should not report error for non-empty attributes", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a download="file.txt"></a>');
			expect(report).toBeValid();
		});

		it("should not report error for boolean attributes", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<input required="">');
			expect(report).toBeValid();
		});

		it("should not report error when attribute is interpolated", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<a download="{{ dynamic }}">', {
				processAttribute,
			});
			expect(report).toBeValid();
		});

		it("should not report error when attribute is dynamic", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<input dynamic-required="dynamic">', {
				processAttribute,
			});
			expect(report).toBeValid();
		});
	});

	it("should throw error if configured with invalid value", () => {
		expect.assertions(1);
		expect(() => {
			return new HtmlValidate({
				rules: { "attribute-empty-style": ["error", { style: "foobar" }] },
			});
		}).toThrowErrorMatchingInlineSnapshot(
			`"Rule configuration error: /rules/attribute-empty-style/1/style should be equal to one of the allowed values: empty, omit"`
		);
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "attribute-empty-style": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("attribute-empty-style")).toMatchSnapshot();
	});
});
