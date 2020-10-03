import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule no-self-closing", () => {
	let htmlvalidate: HtmlValidate;

	describe("default configuration", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "no-self-closing": "error" },
			});
		});

		it("should not report error when element has end tag", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<div></div>");
			expect(report).toBeValid();
		});

		it("should not report error for foreign elements", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<svg/>");
			expect(report).toBeValid();
		});

		it("should not report error for xml namespaces", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<xi:include/>");
			expect(report).toBeValid();
		});

		it("should not report error for void", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<input/>");
			expect(report).toBeValid();
		});

		it("should not report error when void element has end tag", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<input></input>");
			expect(report).toBeValid();
		});

		it("should report error when element is self-closed", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<div/>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-self-closing", "<div> must not be self-closed");
		});

		it("should report error for unknown elements", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<custom-element/>");
			expect(report).toHaveError("no-self-closing", "<custom-element> must not be self-closed");
		});
	});

	describe("ignoreForeign false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "no-self-closing": ["error", { ignoreForeign: false }] },
			});
		});

		it("should report error for foreign elements", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<svg/>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-self-closing", "<svg> must not be self-closed");
		});
	});

	describe("ignoreXML false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "no-self-closing": ["error", { ignoreXML: false }] },
			});
		});

		it("should report error for elements in xml namespace", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<xi:include/>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-self-closing", "<xi:include> must not be self-closed");
		});
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "no-self-closing": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("no-self-closing")).toMatchSnapshot();
	});

	it("should contain contextual documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "no-self-closing": "error" },
		});
		const context = "div";
		expect(htmlvalidate.getRuleDocumentation("no-self-closing", null, context)).toMatchSnapshot();
	});
});
