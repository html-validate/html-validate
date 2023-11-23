import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-style-tag", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-style-tag": "error" },
		});
	});

	it("should not report for other tags", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<div></div>");
		expect(report).toBeValid();
	});

	it("should report error when <style> is used", () => {
		expect.assertions(2);
		const html = "<style>foo</style>";
		const report = htmlvalidate.validateString(html);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-style-tag",
			"Use external stylesheet with <link> instead of <style> tag",
		);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("no-style-tag");
		expect(docs).toMatchSnapshot();
	});
});
