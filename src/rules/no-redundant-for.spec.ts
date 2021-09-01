import HtmlValidate from "../htmlvalidate";
import "../jest";

describe("rule no-redundant-for", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-for": "error" },
		});
	});

	it("should not report when <label> does not have for attribute", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<label><input></label>");
		expect(report).toBeValid();
	});

	it("should not report when <label> references control elsewhere in tree", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<label for="foo"></label><input id="foo">');
		expect(report).toBeValid();
	});

	it("should handle omitted value", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<label for></label>");
		expect(report).toBeValid();
	});

	it("should handle empty value", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<label for=""></label>');
		expect(report).toBeValid();
	});

	it("should handle whitespace", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<label for="a b"></label><input id="a b">');
		expect(report).toBeValid();
	});

	it("should not report error for other elements", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			'<custom-element for="foo"><input id="foo"></custom-element>'
		);
		expect(report).toBeValid();
	});

	it("should report error when <label> references wrapped element", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<label for="foo"><input id="foo"></label>');
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-redundant-for", 'Redundant "for" attribute');
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("no-redundant-for")).toMatchSnapshot();
	});
});
