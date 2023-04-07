import { HtmlValidate } from "../../htmlvalidate";
import "../../jest";

describe("wcag/h32", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
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

	it("should not report when form has nested submit button (button)", () => {
		expect.assertions(1);
		const markup = '<form><button type="submit"></button></form>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when form has nested submit button (input)", () => {
		expect.assertions(1);
		const markup = '<form><input type="submit"></form>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when form has nested submit button (image)", () => {
		expect.assertions(1);
		const markup = '<form><input type="image"></form>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when form has associated submit button", () => {
		expect.assertions(1);
		const markup = '<form id="foo"></form><button form="foo" type="submit"></button>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when form has both nested and associated submit button", () => {
		expect.assertions(1);
		const markup = '<form id="foo"><button form="foo" type="submit"></button></form>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when form is missing submit button", () => {
		expect.assertions(2);
		const markup = "<form></form>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("wcag/h32", "<form> element must have a submit button");
	});

	it("should report error when form only has regular button", () => {
		expect.assertions(2);
		const markup = '<form><button type="button"></button></form>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("wcag/h32", "<form> element must have a submit button");
	});

	it("should report error when form is associated with regular button", () => {
		expect.assertions(2);
		const markup = '<form id="foo"></form><button form="foo" type="button"></button>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("wcag/h32", "<form> element must have a submit button");
	});

	it("should report error when form nested button is associated with another form", () => {
		expect.assertions(2);
		const markup = '<form id="foo"><button form="bar" type="submit"></button></form>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("wcag/h32", "<form> element must have a submit button");
	});

	it("should support custom elements", () => {
		expect.assertions(2);
		const markup = "<my-form></my-form>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("wcag/h32", "<my-form> element must have a submit button");
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
