import HtmlValidate from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule attr-case", () => {
	let htmlvalidate: HtmlValidate;

	describe('configured with "lowercase"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-case": ["error", { style: "lowercase" }] },
			});
		});

		it("should not report error when attributes is lowercase", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it("should not report error when attribute has special characters", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<div foo-bar-9="bar"></div>');
			expect(report).toBeValid();
		});

		it("should report error when attributes is uppercase", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<div FOO="bar"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-case", 'Attribute "FOO" should be lowercase');
		});

		it("should report error when attributes is mixed", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<div clAss="bar"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-case", 'Attribute "clAss" should be lowercase');
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/attr-case.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	describe('configured with "uppercase"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-case": ["error", { style: "uppercase" }] },
			});
		});

		it("should report error when attributes is lowercase", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-case", 'Attribute "foo" should be uppercase');
		});

		it("should not report error when attribute has special characters", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<div FOO-BAR-9="bar"></div>');
			expect(report).toBeValid();
		});

		it("should not report error when attributes is uppercase", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<div FOO="bar"></div>');
			expect(report).toBeValid();
		});

		it("should report error when attributes is mixed", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<div clAss="bar"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-case", 'Attribute "clAss" should be uppercase');
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/attr-case.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	describe('configured with "pascalcase"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-case": ["error", { style: "pascalcase" }] },
			});
		});

		it("should not report error when attributes is PascalCase", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<div FooBar="baz"></div>');
			expect(report).toBeValid();
		});

		it("should not report error when attributes is UPPERCASE", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<div FOOBAR="baz"></div>');
			expect(report).toBeValid();
		});

		it("should report error when attributes is lowercase", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<div foobar="baz"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-case", 'Attribute "foobar" should be PascalCase');
		});

		it("should report error when attributes is camelCase", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<div fooBar="baz"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-case", 'Attribute "fooBar" should be PascalCase');
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/attr-case.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	describe('configured with "camelcase"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-case": ["error", { style: "camelcase" }] },
			});
		});

		it("should not report error when attributes is camelCase", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<div fooBar="baz"></div>');
			expect(report).toBeValid();
		});

		it("should not report error when attributes is lowercase", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<div foobar="baz"></div>');
			expect(report).toBeValid();
		});

		it("should report error when attributes is UPPERCASE", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<div FOOBAR="baz"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-case", 'Attribute "FOOBAR" should be camelCase');
		});

		it("should report error when attributes is PascalCase", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<div FooBar="baz"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-case", 'Attribute "FooBar" should be camelCase');
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/attr-case.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	describe('configured with "ignoreForeign" true', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-case": ["error", { ignoreForeign: true }] },
			});
		});

		it("should not report error on foreign elements", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString('<svg viewBox=""/>');
			expect(report).toBeValid();
		});
	});

	describe('configured with "ignoreForeign" false', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "attr-case": ["error", { ignoreForeign: false }] },
			});
		});

		it("should report error on foreign elements", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<svg viewBox=""/>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-case", 'Attribute "viewBox" should be lowercase');
		});
	});

	it("should handle multiple styles", () => {
		expect.assertions(3);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"attr-case": ["error", { style: ["lowercase", "camelcase"] }],
			},
		});
		expect(htmlvalidate.validateString("<div foo-bar></div>")).toBeValid();
		expect(htmlvalidate.validateString("<div fooBar></div>")).toBeValid();
		expect(htmlvalidate.validateString("<div FooBar></div>")).toHaveError(
			"attr-case",
			'Attribute "FooBar" should be lowercase or camelCase'
		);
	});

	it("should not report duplicate errors for dynamic attributes", () => {
		expect.assertions(2);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "attr-case": "error" },
		});
		const report = htmlvalidate.validateString('<input dynamic-fooBar="foo">', {
			processAttribute,
		});
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			{
				ruleId: "attr-case",
				message: 'Attribute "dynamic-fooBar" should be lowercase',
			},
		]);
	});

	it("should throw error if configured with invalid value", () => {
		expect.assertions(1);
		expect(() => {
			return new HtmlValidate({
				root: true,
				rules: { "attr-case": ["error", { style: "foobar" }] },
			});
		}).toThrowErrorMatchingInlineSnapshot(
			`"Rule configuration error: /rules/attr-case/1/style must be equal to one of the allowed values: lowercase, uppercase, pascalcase, camelcase"`
		);
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "attr-case": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("attr-case")).toMatchSnapshot();
	});

	it("should contain documentation with multiple styles", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "attr-case": ["error", { style: ["lowercase", "camelcase"] }] },
		});
		expect(htmlvalidate.getRuleDocumentation("attr-case")).toMatchSnapshot();
	});
});
