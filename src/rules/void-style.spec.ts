import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule void-style", () => {
	let htmlvalidate: HtmlValidate;

	describe("default", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "void-style": "error" },
			});
		});

		it("should not report when void element omitted end tag", () => {
			const report = htmlvalidate.validateString("<input>");
			expect(report).toBeValid();
		});

		it("should report when void element is self-closed", () => {
			const report = htmlvalidate.validateString("<input/>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"void-style",
				"Expected omitted end tag <input> instead of self-closing element <input/>"
			);
		});

		it("should not report when non-void element has end tag", () => {
			const report = htmlvalidate.validateString("<div></div>");
			expect(report).toBeValid();
		});

		it("should not report when xml namespaces is used", () => {
			const report = htmlvalidate.validateString("<xi:include/>");
			expect(report).toBeValid();
		});
	});

	describe('configured with style="omit"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "void-style": ["error", { style: "omit" }] },
			});
		});

		it("should not report when void element omits end tag", () => {
			const report = htmlvalidate.validateString("<input>");
			expect(report).toBeValid();
		});

		it("should report when void element is self-closed", () => {
			const report = htmlvalidate.validateString("<input/>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"void-style",
				"Expected omitted end tag <input> instead of self-closing element <input/>"
			);
		});
	});

	describe('configured with style="selfclose"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "void-style": ["error", { style: "selfclose" }] },
			});
		});

		it("should report when void element omits end tag", () => {
			const report = htmlvalidate.validateString("<input>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"void-style",
				"Expected self-closing element <input/> instead of omitted end-tag <input>"
			);
		});

		it("should not report when void element is self-closed", () => {
			const report = htmlvalidate.validateString("<input/>");
			expect(report).toBeValid();
		});
	});

	it("should throw error if configured with invalid value", () => {
		htmlvalidate = new HtmlValidate({
			rules: { "void-style": ["error", { style: "foobar" }] },
		});
		expect(() => htmlvalidate.validateString("<input></input>")).toThrow(
			`Invalid style "foobar" for "void-style" rule`
		);
	});

	it("should have documentation", () => {
		htmlvalidate = new HtmlValidate({
			rules: { "void-style": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("void-style")).toMatchSnapshot();
	});

	it("should have contextual documentation", () => {
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
		expect(
			htmlvalidate.getRuleDocumentation("void-style", null, context1)
		).toMatchSnapshot();
		expect(
			htmlvalidate.getRuleDocumentation("void-style", null, context2)
		).toMatchSnapshot();
	});
});
