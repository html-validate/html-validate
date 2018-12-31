import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule attr-case", () => {
	let htmlvalidate: HtmlValidate;

	describe('configured with "lowercase"', () => {

		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: {"attr-case": ["error", {style: "lowercase"}]},
			});
		});

		it("should not report error when attributes is lowercase", () => {
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it("should not report error when attribute has special characters", () => {
			const report = htmlvalidate.validateString('<div foo-bar-9="bar"></div>');
			expect(report).toBeValid();
		});

		it("should report error when attributes is uppercase", () => {
			const report = htmlvalidate.validateString('<div FOO="bar"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-case", 'Attribute "FOO" should be lowercase');
		});

		it("should report error when attributes is mixed", () => {
			const report = htmlvalidate.validateString('<div clAss="bar"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-case", 'Attribute "clAss" should be lowercase');
		});

		it("smoketest", () => {
			const report = htmlvalidate.validateFile("test-files/rules/attr-case.html");
			expect(report.results).toMatchSnapshot();
		});

	});

	describe('configured with "uppercase"', () => {

		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: {"attr-case": ["error", {style: "uppercase"}]},
			});
		});

		it("should report error when attributes is lowercase", () => {
			const report = htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-case", 'Attribute "foo" should be uppercase');
		});

		it("should not report error when attribute has special characters", () => {
			const report = htmlvalidate.validateString('<div FOO-BAR-9="bar"></div>');
			expect(report).toBeValid();
		});

		it("should not report error when attributes is uppercase", () => {
			const report = htmlvalidate.validateString('<div FOO="bar"></div>');
			expect(report).toBeValid();
		});

		it("should report error when attributes is mixed", () => {
			const report = htmlvalidate.validateString('<div clAss="bar"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-case", 'Attribute "clAss" should be uppercase');
		});

		it("smoketest", () => {
			const report = htmlvalidate.validateFile("test-files/rules/attr-case.html");
			expect(report.results).toMatchSnapshot();
		});

	});

	it("should throw error if configured with invalid value", () => {
		htmlvalidate = new HtmlValidate({
			rules: {"attr-case": ["error", {style: "foobar"}]},
		});
		expect(() => htmlvalidate.validateString("<foo></foo>")).toThrow(`Invalid style "foobar" for "attr-case" rule`);
	});

	it("should contain documentation", () => {
		htmlvalidate = new HtmlValidate({
			rules: {"attr-case": "error"},
		});
		expect(htmlvalidate.getRuleDocumentation("attr-case")).toMatchSnapshot();
	});

});
