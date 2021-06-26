import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule attr-quotes", () => {
	let htmlvalidate: HtmlValidate;

	describe("with double-quote option", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "attr-quotes": ["error", { style: "double" }] },
			});
		});

		it("should not report when attributes use double quotes", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it("should not report for boolean attribute", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<input checked>");
			expect(report).toBeValid();
		});

		it("should report error when attributes use single quotes", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<div foo='bar'></div>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-quotes", 'Attribute "foo" used \' instead of expected "');
		});
	});

	describe("with single-quote option", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "attr-quotes": ["error", { style: "single" }] },
			});
		});

		it("should report error when attributes use double quotes", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-quotes", 'Attribute "foo" used " instead of expected \'');
		});

		it("should not report when attributes use single quotes", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<div foo='bar'></div>");
			expect(report).toBeValid();
		});
	});

	describe("with auto option", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "attr-quotes": ["error", { style: "auto" }] },
			});
		});

		it("should not report when attributes use double quotes", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it("should not report when attributes use single quotes with double quote present inside", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString(`<div foo='"bar"'></div>`);
			expect(report).toBeValid();
		});

		it("should report error when attributes use single quotes", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<div foo='bar'></div>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-quotes", 'Attribute "foo" used \' instead of expected "');
		});
	});

	describe("with unquoted allowed", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: {
					"attr-quotes": ["error", { style: "double", unquoted: true }],
				},
			});
		});

		it("should not report when attributes is using quotes", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it("should not report error when attribute value is unquoted", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<div foo=5></div>");
			expect(report).toBeValid();
		});
	});

	describe("with unquoted disabled", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: {
					"attr-quotes": ["error", { style: "double", unquoted: false }],
				},
			});
		});

		it("should not report when attributes is using quotes", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it("should report error when attribute value is unquoted", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<div foo=5></div>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-quotes", 'Attribute "foo" using unquoted value');
		});
	});

	it("should throw error if configured with invalid value", () => {
		expect.assertions(1);
		expect(() => {
			return new HtmlValidate({
				rules: { "attr-quotes": ["error", { style: "foobar" }] },
			});
		}).toThrowErrorMatchingInlineSnapshot(
			`"Rule configuration error: /rules/attr-quotes/1/style must be equal to one of the allowed values: auto, double, single"`
		);
	});

	it("should contain documentation (auto)", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "attr-quotes": ["error", { style: "auto" }] },
		});
		expect(htmlvalidate.getRuleDocumentation("attr-quotes")).toMatchSnapshot();
	});

	it("should contain documentation (fixed)", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "attr-quotes": ["error", { style: "double" }] },
		});
		expect(htmlvalidate.getRuleDocumentation("attr-quotes")).toMatchSnapshot();
	});
});
