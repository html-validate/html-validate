import HtmlValidate from "../../htmlvalidate";
import "../../matchers";

describe("wcag/h32", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			elements: [
				"html5",
				{
					"my-form": {
						form: true,
					},
				},
			],
			rules: { "wcag/h32": "error" },
		});
	});

	it("should not report when form has submit button", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			'<form><button type="submit"></button></form>'
		);
		expect(report).toBeValid();
	});

	it("should not report when form has submit button (input)", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			'<form><input type="submit"></form>'
		);
		expect(report).toBeValid();
	});

	it("should report error when form is missing submit button", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<form></form>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"wcag/h32",
			"<form> element must have a submit button"
		);
	});

	it("should report error when form only has regular button", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString(
			'<form><button type="button"></button></form>'
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"wcag/h32",
			"<form> element must have a submit button"
		);
	});

	it("should support custom elements", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<my-form></my-form>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"wcag/h32",
			"<my-form> element must have a submit button"
		);
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/wcag/h32.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h32": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("wcag/h32")).toMatchSnapshot();
	});
});
