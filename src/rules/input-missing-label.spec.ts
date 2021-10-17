import HtmlValidate from "../htmlvalidate";
import "../jest";

describe("rule input-missing-label", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "input-missing-label": "error" },
		});
	});

	it("should not report when input id has matching label", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<label for="foo">foo</label><input id="foo"/>');
		expect(report).toBeValid();
	});

	it('should not report input type="hidden" is missing label', () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<input type="hidden" />');
		expect(report).toBeValid();
	});

	it("should not report when input is nested inside label", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<label>foo <input/></label>");
		expect(report).toBeValid();
	});

	it("should not report when input is hidden", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<input hidden>");
		expect(report).toBeValid();
	});

	it("should not report when input is aria-hidden", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<input aria-hidden="true">');
		expect(report).toBeValid();
	});

	it("should handle multiple labels", () => {
		expect.assertions(1);
		const markup = '<label for="foo">foo</label><label for="foo">bar</label><input id="foo"/>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when at least one label is accessible", () => {
		expect.assertions(1);
		const markup = `
			<label for="foo" aria-hidden="true">foo</label>
			<label for="foo">bar</label>
			<input id="foo"/>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it.each(["input", "textarea", "select"])(
		"should report when <%s> is missing label",
		(tagName: string) => {
			expect.assertions(2);
			const report = htmlvalidate.validateString(`<${tagName}/>`);
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"input-missing-label",
				`<${tagName}> element does not have a <label>`
			);
		}
	);

	it("should report error when label is hidden", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<label for="foo" hidden></label><input id="foo">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"input-missing-label",
			`<input> element has label but <label> element is hidden`
		);
	});

	it("should report error when label is aria-hidden", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<label for="foo" hidden></label><input id="foo">');
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"input-missing-label",
			`<input> element has label but <label> element is hidden`
		);
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/input-missing-label.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("input-missing-label")).toMatchSnapshot();
	});
});
