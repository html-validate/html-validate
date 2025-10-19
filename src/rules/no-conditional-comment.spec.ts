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
		const markup = /* HTML */ ` <!-- --> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when <!--[...]--> is used", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <!--[if foo]--> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Use of conditional comments are deprecated (no-conditional-comment) at inline:1:2:
			> 1 |  <!--[if foo]-->
			    |  ^^^^^^^^^^^^^^^
			Selector: -"
		`);
	});

	it("should report error when <![...]> is used", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <!-- foo <![if bar]> baz --> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Use of conditional comments are deprecated (no-conditional-comment) at inline:1:11:
			> 1 |  <!-- foo <![if bar]> baz -->
			    |           ^^^^^^^^^^^
			Selector: -"
		`);
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/no-conditional-comment.html");
		expect(report).toMatchCodeframe();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("no-conditional-comment");
		expect(docs).toMatchSnapshot();
	});
});
