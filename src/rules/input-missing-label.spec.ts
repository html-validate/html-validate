import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule input-missing-label", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "input-missing-label": "error" },
		});
	});

	it("should not report when input id has matching label", () => {
		const report = htmlvalidate.validateString(
			'<label for="foo">foo</label><input id="foo"/>'
		);
		expect(report).toBeValid();
	});

	it("should not report when input is nested inside label", () => {
		const report = htmlvalidate.validateString("<label>foo <input/></label>");
		expect(report).toBeValid();
	});

	it.each(["input", "textarea", "select"])(
		"should report when <%s> is missing label",
		(tagName: string) => {
			const report = htmlvalidate.validateString(`<${tagName}/>`);
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"input-missing-label",
				`<${tagName}> element does not have a <label>`
			);
		}
	);

	it("smoketest", () => {
		const report = htmlvalidate.validateFile(
			"test-files/rules/input-missing-label.html"
		);
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect(
			htmlvalidate.getRuleDocumentation("input-missing-label")
		).toMatchSnapshot();
	});
});
