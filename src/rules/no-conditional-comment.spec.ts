import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-conditional-comment", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-conditional-comment": "error" },
		});
	});

	it("should not report error for regular HTML comment", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<!-- -->");
		expect(report).toBeValid();
	});

	it("should report error when <!--[...]--> is used", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<!--[if foo]-->");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-conditional-comment",
			"Use of conditional comments are deprecated"
		);
	});

	it("should report error when <![...]> is used", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<!-- foo <![if bar]> baz -->");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-conditional-comment",
			"Use of conditional comments are deprecated"
		);
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/no-conditional-comment.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("no-conditional-comment")).toMatchSnapshot();
	});
});
