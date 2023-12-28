import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule element-case", () => {
	let htmlvalidate: HtmlValidate;

	describe('configured with "lowercase"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "element-case": ["error", { style: "lowercase" }] },
			});
		});

		it("should not report error when element is lowercase", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<foo></foo>");
			expect(report).toBeValid();
		});

		it("should not report error when element has special characters", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<foo-bar-9></foo-bar-9>");
			expect(report).toBeValid();
		});

		it("should report error when element is uppercase", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString("<FOO></FOO>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("element-case", 'Element "FOO" should be lowercase');
		});

		it("should report error when element is mixed", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString("<fOo></fOo>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("element-case", 'Element "fOo" should be lowercase');
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("test-files/rules/element-case.html");
			expect(report).toMatchInlineCodeframe(`
				"error: Element "DIV" should be lowercase (element-case) at test-files/rules/element-case.html:2:2:
				  1 | <div></div>
				> 2 | <DIV></DIV>
				    |  ^^^
				  3 | <dIV></dIV>
				  4 |
				Selector: div:nth-child(2)
				error: Element "dIV" should be lowercase (element-case) at test-files/rules/element-case.html:3:2:
				  1 | <div></div>
				  2 | <DIV></DIV>
				> 3 | <dIV></dIV>
				    |  ^^^
				  4 |
				Selector: div:nth-child(3)"
			`);
		});
	});

	describe('configured with "uppercase"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "element-case": ["error", { style: "uppercase" }] },
			});
		});

		it("should report error when element is lowercase", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString("<foo></foo>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("element-case", 'Element "foo" should be uppercase');
		});

		it("should not report error when element has special characters", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<FOO-BAR-9></FOO-BAR-9>");
			expect(report).toBeValid();
		});

		it("should not report error when element is uppercase", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<FOO></FOO>");
			expect(report).toBeValid();
		});

		it("should report error when element is mixed", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString("<fOo></fOo>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("element-case", 'Element "fOo" should be uppercase');
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateFile("test-files/rules/element-case.html");
			expect(report).toMatchInlineCodeframe(`
				"error: Element "div" should be uppercase (element-case) at test-files/rules/element-case.html:1:2:
				> 1 | <div></div>
				    |  ^^^
				  2 | <DIV></DIV>
				  3 | <dIV></dIV>
				  4 |
				Selector: div:nth-child(1)
				error: Element "dIV" should be uppercase (element-case) at test-files/rules/element-case.html:3:2:
				  1 | <div></div>
				  2 | <DIV></DIV>
				> 3 | <dIV></dIV>
				    |  ^^^
				  4 |
				Selector: div:nth-child(3)"
			`);
		});
	});

	describe('configured with "pascalcase"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "element-case": ["error", { style: "pascalcase" }] },
			});
		});

		it("should report error when element is lowercase", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString("<foo-bar></foo-bar>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("element-case", 'Element "foo-bar" should be PascalCase');
		});

		it("should not report error when element is pascalcase", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<FooBar></FooBar>");
			expect(report).toBeValid();
		});
	});

	describe('configured with "camelcase"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "element-case": ["error", { style: "camelcase" }] },
			});
		});

		it("should report error when element is pascalcase", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString("<FooBar></FooBar>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("element-case", 'Element "FooBar" should be camelCase');
		});

		it("should not report error when element is camelcase", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<fooBar></fooBar>");
			expect(report).toBeValid();
		});
	});

	it("should handle multiple styles", async () => {
		expect.assertions(3);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"element-case": ["error", { style: ["lowercase", "pascalcase"] }],
			},
		});
		expect(htmlvalidate.validateString("<foo-bar></foo-bar>")).toBeValid();
		expect(htmlvalidate.validateString("<FooBar></FooBar>")).toBeValid();
		expect(htmlvalidate.validateString("<fooBar></fooBar>")).toHaveError(
			"element-case",
			'Element "fooBar" should be lowercase or PascalCase',
		);
	});

	it("should throw error if configured with invalid value", async () => {
		expect.assertions(1);
		expect(() => {
			return new HtmlValidate({
				root: true,
				rules: { "element-case": ["error", { style: "foobar" }] },
			});
		}).toThrowErrorMatchingInlineSnapshot(
			`"Rule configuration error: /rules/element-case/1/style must be equal to one of the allowed values: lowercase, uppercase, pascalcase, camelcase"`,
		);
	});

	it("should report error if start and close tag have different case", async () => {
		expect.assertions(2);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "element-case": ["error", { style: "camelcase" }] },
		});
		const report = await htmlvalidate.validateString("<foo-Bar></foo-bar>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("element-case", "Start and end tag must not differ in casing");
	});

	it("should not report error when elements are closed out-of-order", async () => {
		expect.assertions(4);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "element-case": "error" },
		});
		expect(htmlvalidate.validateString("<p></i>")).toBeValid();
		expect(htmlvalidate.validateString("<p>")).toBeValid();
		expect(htmlvalidate.validateString("</i>")).toBeValid();
		expect(htmlvalidate.validateString("<input></input>")).toBeValid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "element-case": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("element-case");
		expect(docs).toMatchSnapshot();
	});

	it("should contain documentation with multiple styles", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "element-case": ["error", { style: ["lowercase", "pascalcase"] }] },
		});
		const docs = await htmlvalidate.getRuleDocumentation("element-case");
		expect(docs).toMatchSnapshot();
	});
});
