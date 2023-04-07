import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule void", () => {
	let htmlvalidate: HtmlValidate;

	it("should be deprecated", () => {
		expect.assertions(2);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "deprecated-rule": "error", void: "error" },
		});
		const report = htmlvalidate.validateString("<div>lorem ipsum</div>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("deprecated-rule", 'Usage of deprecated rule "void"');
	});

	describe("default", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { void: "error" },
			});
		});

		it("should not report when void element omitted end tag", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<input>");
			expect(report).toBeValid();
		});

		it("should report when void element is self-closed", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<input/>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"void",
				"Expected omitted end tag <input> instead of self-closing element <input/>"
			);
		});

		it("should not report when non-void element has end tag", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<div></div>");
			expect(report).toBeValid();
		});

		it("should not report when xml namespaces is used", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<xi:include/>");
			expect(report).toBeValid();
		});

		it("should not report foreign elements", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<svg></svg> <svg/>");
			expect(report).toBeValid();
		});

		it("should report error when non-void element omitted end tag", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<div/>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("void", "End tag for <div> must not be omitted");
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/void.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	describe('configured with style="omit"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { void: ["error", { style: "omit" }] },
			});
		});

		it("should not report when void element omits end tag", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<input>");
			expect(report).toBeValid();
		});

		it("should report when void element is self-closed", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<input/>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"void",
				"Expected omitted end tag <input> instead of self-closing element <input/>"
			);
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/void.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	describe('configured with style="selfclose"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { void: ["error", { style: "selfclose" }] },
			});
		});

		it("should report when void element omits end tag", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<input>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"void",
				"Expected self-closing element <input/> instead of omitted end-tag <input>"
			);
		});

		it("should not report when void element is self-closed", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<input/>");
			expect(report).toBeValid();
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/void.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	describe('configured with style="any"', () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { void: ["error", { style: "any" }] },
			});
		});

		it("should not report when void element omits end tag", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<input>");
			expect(report).toBeValid();
		});

		it("should not report when void element is self-closed", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<input/>");
			expect(report).toBeValid();
		});

		it("smoketest", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateFile("test-files/rules/void.html");
			expect(report.results).toMatchSnapshot();
		});
	});

	it("should throw error if configured with invalid value", () => {
		expect.assertions(1);
		expect(() => {
			return new HtmlValidate({
				root: true,
				rules: { void: ["error", { style: "foobar" }] },
			});
		}).toThrowErrorMatchingInlineSnapshot(
			`"Rule configuration error: /rules/void/1/style must be equal to one of the allowed values: any, omit, selfclose, selfclosing"`
		);
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { void: "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("void")).toMatchSnapshot();
	});
});
