import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule attr-spacing", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "attr-spacing": ["error"] },
		});
	});

	it("should not report when attributes have separating whitespace", () => {
		expect.assertions(1);
		const markup = '<i foo="1" bar="2"></i>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle boolean attributes", () => {
		expect.assertions(1);
		const markup = "<i foo bar></i>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle newline attributes", () => {
		expect.assertions(1);
		const markup = "<i foo\nbar></i>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when attributes does not have separating whitespace", () => {
		expect.assertions(2);
		const markup = '<i foo="1"bar="2"></i>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("attr-spacing", "No space between attributes");
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("attr-spacing")).toMatchSnapshot();
	});
});
