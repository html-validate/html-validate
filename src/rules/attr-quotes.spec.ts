import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { RuleStyleContext, RuleUnquotedContext } from "./attr-quotes";

describe("rule attr-quotes", () => {
	let htmlvalidate: HtmlValidate;

	describe("with double-quote option", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "attr-quotes": ["error", { style: "double" }] },
			});
		});

		it("should not report when attributes use double quotes", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it("should not report for boolean attribute", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<input checked>");
			expect(report).toBeValid();
		});

		it("should report error when attributes use single quotes", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString("<div foo='bar'></div>");
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

		it("should report error when attributes use double quotes", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-quotes", 'Attribute "foo" used " instead of expected \'');
		});

		it("should not report when attributes use single quotes", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<div foo='bar'></div>");
			expect(report).toBeValid();
		});
	});

	describe("with auto option", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "attr-quotes": ["error", { style: "auto" }] },
			});
		});

		it("should not report when attributes use double quotes", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it("should not report when attributes use single quotes with double quote present inside", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString(`<div foo='"bar"'></div>`);
			expect(report).toBeValid();
		});

		it("should report error when attributes use single quotes", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString("<div foo='bar'></div>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("attr-quotes", 'Attribute "foo" used \' instead of expected "');
		});
	});

	describe("with any option", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "attr-quotes": ["error", { style: "any" }] },
			});
		});

		it("should not report when attributes use double quotes", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it("should not report error when attributes use single quotes", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<div foo='bar'></div>");
			expect(report).toBeValid();
		});

		it("should not report for boolean attribute", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<input checked>");
			expect(report).toBeValid();
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

		it("should not report when attributes is using quotes", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it("should not report error when attribute value is unquoted", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<div foo=5></div>");
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

		it("should not report when attributes is using quotes", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString('<div foo="bar"></div>');
			expect(report).toBeValid();
		});

		it("should report error when attribute value is unquoted", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString("<div foo=5></div>");
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
			`"Rule configuration error: /rules/attr-quotes/1/style must be equal to one of the allowed values: auto, double, single, any"`
		);
	});

	describe("should contain documentation", () => {
		it("url", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				rules: { "attr-quotes": "error" },
			});
			const context: RuleUnquotedContext = {
				error: "unquoted",
				attr: "foo",
			};
			const docs = await htmlvalidate.getRuleDocumentation("attr-quotes", null, context);
			expect(docs?.url).toMatchInlineSnapshot(`"https://html-validate.org/rules/attr-quotes.html"`);
		});

		it("with unquoted context", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				rules: { "attr-quotes": "error" },
			});
			const context: RuleUnquotedContext = {
				error: "unquoted",
				attr: "foo",
			};
			const docs = await htmlvalidate.getRuleDocumentation("attr-quotes", null, context);
			expect(docs?.description).toMatchSnapshot();
		});

		it("with style context", async () => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				rules: { "attr-quotes": "error" },
			});
			const context: RuleStyleContext = {
				error: "style",
				attr: "foo",
				actual: "'",
				expected: '"',
			};
			const docs = await htmlvalidate.getRuleDocumentation("attr-quotes", null, context);
			expect(docs?.description).toMatchSnapshot();
		});

		it.each`
			style       | unquoted
			${"auto"}   | ${false}
			${"auto"}   | ${true}
			${"any"}    | ${false}
			${"any"}    | ${true}
			${"single"} | ${false}
			${"single"} | ${true}
			${"double"} | ${false}
			${"double"} | ${true}
		`('style "$style" and unquoted "$unquoted"', async ({ style, unquoted }) => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				rules: { "attr-quotes": ["error", { style, unquoted }] },
			});
			const context: RuleUnquotedContext = {
				error: "unquoted",
				attr: "foo",
			};
			const docs = await htmlvalidate.getRuleDocumentation("attr-quotes", null, context);
			expect(docs?.description).toMatchSnapshot();
		});
	});
});
