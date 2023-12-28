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

	it("should not report error for regular HTML comment", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<!-- -->");
		expect(report).toBeValid();
	});

	it("should report error when <!--[...]--> is used", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString("<!--[if foo]-->");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-conditional-comment",
			"Use of conditional comments are deprecated",
		);
	});

	it("should report error when <![...]> is used", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString("<!-- foo <![if bar]> baz -->");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-conditional-comment",
			"Use of conditional comments are deprecated",
		);
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/no-conditional-comment.html");
		expect(report).toMatchCodeframe();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("no-conditional-comment");
		expect(docs).toMatchSnapshot();
	});
});
