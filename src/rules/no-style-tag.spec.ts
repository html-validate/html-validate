import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule no-style-tag", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-style-tag": "error" },
		});
	});

	it("should not report for other tags", () => {
		const report = htmlvalidate.validateString("<div></div>");
		expect(report).toBeValid();
	});

	it("should not report error when <style> is used", () => {
		const html = "<style>foo</style>";
		const report = htmlvalidate.validateString(html);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-style-tag",
			"Use external stylesheet with <link> instead of <style> tag"
		);
	});

	it("should contain documentation", () => {
		expect(htmlvalidate.getRuleDocumentation("no-style-tag")).toMatchSnapshot();
	});
});
