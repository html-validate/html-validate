import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule void-style", () => {
	let htmlvalidate: HtmlValidate;

	describe("default", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "void-style": "error" },
			});
		});

		it("should not report when void element omitted end tag", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<input>");
			expect(report).toBeValid();
		});

		it("should report when void element is self-closed", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString("<input/>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"void-style",
				"Expected omitted end tag <input> instead of self-closing element <input/>",
			);
		});

		it("should not report when non-void element has end tag", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<div></div>");
			expect(report).toBeValid();
		});

		it("should not report when non-void element is self-closed", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<div/>");
			expect(report).toBeValid();
		});

		it("should not report when xml namespaces is used", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<xi:include/>");
			expect(report).toBeValid();
		});
	});

	describe('configured with style="omit"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "void-style": ["error", { style: "omit" }] },
			});
		});

		it("should not report when void element omits end tag", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<input>");
			expect(report).toBeValid();
		});

		it("should report when void element is self-closed", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString("<input/>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"void-style",
				"Expected omitted end tag <input> instead of self-closing element <input/>",
			);
		});
	});

	describe('configured with style="selfclose"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "void-style": ["error", { style: "selfclose" }] },
			});
		});

		it("should report when void element omits end tag", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString("<input>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"void-style",
				"Expected self-closing element <input/> instead of omitted end-tag <input>",
			);
		});

		it("should not report when void element is self-closed", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<input/>");
			expect(report).toBeValid();
		});
	});

	it("should throw error if configured with invalid value", () => {
		expect.assertions(1);
		expect(() => {
			return new HtmlValidate({
				rules: { "void-style": ["error", { style: "foobar" }] },
			});
		}).toThrowErrorMatchingInlineSnapshot(
			`"Rule configuration error: /rules/void-style/1/style must be equal to one of the allowed values: omit, selfclose, selfclosing"`,
		);
	});

	it("should have documentation", async () => {
		expect.assertions(2);
		htmlvalidate = new HtmlValidate({
			rules: { "void-style": "error" },
		});
		const context1 = {
			style: 1,
			tagName: "foo",
		};
		const context2 = {
			style: 2,
			tagName: "bar",
		};
		const docs1 = await htmlvalidate.getContextualDocumentation({
			ruleId: "void-style",
			context: context1,
		});
		const docs2 = await htmlvalidate.getContextualDocumentation({
			ruleId: "void-style",
			context: context2,
		});
		expect(docs1).toMatchSnapshot();
		expect(docs2).toMatchSnapshot();
	});
});
