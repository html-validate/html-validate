import { Source } from "../context";
import { DynamicValue } from "../dom";
import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule attribute-boolean-style", () => {
	let htmlvalidate: HtmlValidate;

	it("should not report for non-boolean attributes", () => {
		htmlvalidate = new HtmlValidate({
			rules: { "attribute-boolean-style": ["error", { style: "omit" }] },
		});
		const report = htmlvalidate.validateString('<input type="foo">');
		expect(report).toBeValid();
	});

	describe('configured with "omit"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "attribute-boolean-style": ["error", { style: "omit" }] },
			});
		});

		it("should not report error when value is omitted", () => {
			const report = htmlvalidate.validateString("<input required>");
			expect(report).toBeValid();
		});

		it("should not report error for non-boolean attributes", () => {
			const report = htmlvalidate.validateString('<input type="text">');
			expect(report).toBeValid();
		});

		it("should report error when value is empty string", () => {
			const report = htmlvalidate.validateString('<input required="">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" should omit value'
			);
		});

		it("should report error when value is attribute name", () => {
			const report = htmlvalidate.validateString('<input required="required">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" should omit value'
			);
		});

		it("should report error when attribute is dynamic", () => {
			const processAttribute = jest.fn(attr => {
				attr.value = new DynamicValue(attr.value);
			});
			const source: Source = {
				data: '<input required="{{ dynamic }}"></button>',
				filename: "inline",
				line: 1,
				column: 1,
				hooks: {
					processAttribute,
				},
			};
			const report = htmlvalidate.validateSource(source);
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" should omit value'
			);
		});

		it("smoketest", () => {
			const report = htmlvalidate.validateFile(
				"test-files/rules/attribute-boolean-style.html"
			);
			expect(report.results).toMatchSnapshot();
		});
	});

	describe('configured with "empty"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "attribute-boolean-style": ["error", { style: "empty" }] },
			});
		});

		it("should report error when value is omitted", () => {
			const report = htmlvalidate.validateString("<input required>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" value should be empty string'
			);
		});

		it("should not report error when value is empty string", () => {
			const report = htmlvalidate.validateString('<input required="">');
			expect(report).toBeValid();
		});

		it("should report error when value is attribute name", () => {
			const report = htmlvalidate.validateString('<input required="required">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" value should be empty string'
			);
		});

		it("should report error when attribute is dynamic", () => {
			const processAttribute = jest.fn(attr => {
				attr.value = new DynamicValue(attr.value);
			});
			const source: Source = {
				data: '<input required="{{ dynamic }}"></button>',
				filename: "inline",
				line: 1,
				column: 1,
				hooks: {
					processAttribute,
				},
			};
			const report = htmlvalidate.validateSource(source);
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" value should be empty string'
			);
		});

		it("smoketest", () => {
			const report = htmlvalidate.validateFile(
				"test-files/rules/attribute-boolean-style.html"
			);
			expect(report.results).toMatchSnapshot();
		});
	});

	describe('configured with "name"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "attribute-boolean-style": ["error", { style: "name" }] },
			});
		});

		it("should not report error when value is omitted", () => {
			const report = htmlvalidate.validateString("<input required>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" should be set to required="required"'
			);
		});

		it("should report error when value is empty string", () => {
			const report = htmlvalidate.validateString('<input required="">');
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" should be set to required="required"'
			);
		});

		it("should report error when value is attribute name", () => {
			const report = htmlvalidate.validateString('<input required="required">');
			expect(report).toBeValid();
		});

		it("should report error when attribute is dynamic", () => {
			const processAttribute = jest.fn(attr => {
				attr.value = new DynamicValue(attr.value);
			});
			const source: Source = {
				data: '<input required="{{ dynamic }}"></button>',
				filename: "inline",
				line: 1,
				column: 1,
				hooks: {
					processAttribute,
				},
			};
			const report = htmlvalidate.validateSource(source);
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"attribute-boolean-style",
				'Attribute "required" should be set to required="required"'
			);
		});

		it("smoketest", () => {
			const report = htmlvalidate.validateFile(
				"test-files/rules/attribute-boolean-style.html"
			);
			expect(report.results).toMatchSnapshot();
		});
	});

	it("should throw error if configured with invalid value", () => {
		htmlvalidate = new HtmlValidate({
			rules: { "attribute-boolean-style": ["error", { style: "foobar" }] },
		});
		expect(() => htmlvalidate.validateString("<foo></foo>")).toThrow(
			`Invalid style "foobar" for "attribute-boolean-style" rule`
		);
	});

	it("should contain documentation", () => {
		htmlvalidate = new HtmlValidate({
			rules: { "attribute-boolean-style": "error" },
		});
		expect(
			htmlvalidate.getRuleDocumentation("attribute-boolean-style")
		).toMatchSnapshot();
	});
});
