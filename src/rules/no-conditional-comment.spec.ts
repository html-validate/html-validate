import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule no-conditional-comment", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: {"no-conditional-comment": "error"},
		});
	});

	it("should not report error for regular HTML comment", () => {
		const report = htmlvalidate.validateString("<!-- -->");
		expect(report).toBeValid();
	});

	it("should report error when <![...]> is used", () => {
		const report = htmlvalidate.validateString("<![if foo]>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-conditional-comment", "Use of conditional comments are deprecated");
	});

	it("should report error when <!--[...]> is used", () => {
		const report = htmlvalidate.validateString("<!--[if foo]>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-conditional-comment", "Use of conditional comments are deprecated");
	});

	it("should report error when <![...]--> is used", () => {
		const report = htmlvalidate.validateString("<![endif]-->");
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-conditional-comment", "Use of conditional comments are deprecated");
	});

	it("smoketest", () => {
		const report = htmlvalidate.validateFile("test-files/rules/no-conditional-comment.html");
		expect(report.results).toMatchSnapshot();
	});

});
