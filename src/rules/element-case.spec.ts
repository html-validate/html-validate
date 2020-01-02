import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule element-case", () => {
	let htmlvalidate: HtmlValidate;

	describe('configured with "lowercase"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "element-case": ["error", { style: "lowercase" }] },
			});
		});

		it("should not report error when element is lowercase", () => {
			const report = htmlvalidate.validateString("<foo></foo>");
			expect(report).toBeValid();
		});

		it("should not report error when element has special characters", () => {
			const report = htmlvalidate.validateString("<foo-bar-9></foo-bar-9>");
			expect(report).toBeValid();
		});

		it("should report error when element is uppercase", () => {
			const report = htmlvalidate.validateString("<FOO></FOO>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"element-case",
				'Element "FOO" should be lowercase'
			);
		});

		it("should report error when element is mixed", () => {
			const report = htmlvalidate.validateString("<fOo></fOo>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"element-case",
				'Element "fOo" should be lowercase'
			);
		});

		it("smoketest", () => {
			const report = htmlvalidate.validateFile(
				"test-files/rules/element-case.html"
			);
			expect(report.results).toMatchSnapshot();
		});
	});

	describe('configured with "uppercase"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "element-case": ["error", { style: "uppercase" }] },
			});
		});

		it("should report error when element is lowercase", () => {
			const report = htmlvalidate.validateString("<foo></foo>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"element-case",
				'Element "foo" should be uppercase'
			);
		});

		it("should not report error when element has special characters", () => {
			const report = htmlvalidate.validateString("<FOO-BAR-9></FOO-BAR-9>");
			expect(report).toBeValid();
		});

		it("should not report error when element is uppercase", () => {
			const report = htmlvalidate.validateString("<FOO></FOO>");
			expect(report).toBeValid();
		});

		it("should report error when element is mixed", () => {
			const report = htmlvalidate.validateString("<fOo></fOo>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"element-case",
				'Element "fOo" should be uppercase'
			);
		});

		it("smoketest", () => {
			const report = htmlvalidate.validateFile(
				"test-files/rules/element-case.html"
			);
			expect(report.results).toMatchSnapshot();
		});
	});

	describe('configured with "pascalcase"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "element-case": ["error", { style: "pascalcase" }] },
			});
		});

		it("should report error when element is lowercase", () => {
			const report = htmlvalidate.validateString("<foo-bar></foo-bar>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"element-case",
				'Element "foo-bar" should be PascalCase'
			);
		});

		it("should not report error when element is pascalcase", () => {
			const report = htmlvalidate.validateString("<FooBar></FooBar>");
			expect(report).toBeValid();
		});
	});

	describe('configured with "camelcase"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "element-case": ["error", { style: "camelcase" }] },
			});
		});

		it("should report error when element is pascalcase", () => {
			const report = htmlvalidate.validateString("<FooBar></FooBar>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"element-case",
				'Element "FooBar" should be camelCase'
			);
		});

		it("should not report error when element is camelcase", () => {
			const report = htmlvalidate.validateString("<fooBar></fooBar>");
			expect(report).toBeValid();
		});
	});

	it("should handle multiple styles", () => {
		expect.assertions(3);
		htmlvalidate = new HtmlValidate({
			rules: {
				"element-case": ["error", { style: ["lowercase", "pascalcase"] }],
			},
		});
		expect(htmlvalidate.validateString("<foo-bar></foo-bar>")).toBeValid();
		expect(htmlvalidate.validateString("<FooBar></FooBar>")).toBeValid();
		expect(htmlvalidate.validateString("<fooBar></fooBar>")).toHaveError(
			"element-case",
			'Element "fooBar" should be lowercase or PascalCase'
		);
	});

	it("should throw error if configured with invalid value", () => {
		htmlvalidate = new HtmlValidate({
			rules: { "element-case": ["error", { style: "foobar" }] },
		});
		expect(() => htmlvalidate.validateString("<foo></foo>")).toThrow(
			`Invalid style "foobar" for element-case rule`
		);
	});

	it("should report error if start and close tag have different case", () => {
		expect.assertions(2);
		htmlvalidate = new HtmlValidate({
			rules: { "element-case": ["error", { style: "camelcase" }] },
		});
		const report = htmlvalidate.validateString("<foo-Bar></foo-bar>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"element-case",
			"Start and end tag must not differ in casing"
		);
	});

	it("should not report error when elements are closed out-of-order", () => {
		expect.assertions(4);
		expect(htmlvalidate.validateString("<p></i>")).toBeValid();
		expect(htmlvalidate.validateString("<p>")).toBeValid();
		expect(htmlvalidate.validateString("</i>")).toBeValid();
		expect(htmlvalidate.validateString("<input></input>")).toBeValid();
	});

	it("should contain documentation", () => {
		htmlvalidate = new HtmlValidate({
			rules: { "element-case": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("element-case")).toMatchSnapshot();
	});
});
