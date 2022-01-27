import HtmlValidate from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule attr-case", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "aria-hidden-body": "error" },
		});
	});

	it("should not report error for other elements", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<div aria-hidden="true"></div>');
		expect(report).toBeValid();
	});

	it("should not report error when body is missing aria-hidden attribute", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<body></body>");
		expect(report).toBeValid();
	});

	it("should not report error when body is missing aria-hidden value", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<body aria-hidden></div>");
		expect(report).toBeValid();
	});

	it("should not report error when body has invalid aria-hidden value", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<body aria-hidden="foobar">');
		expect(report).toBeValid();
	});

	it('should not report error when body has aria-hidden="false"', () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<body aria-hidden="false"></body>');
		expect(report).toBeValid();
	});

	it('should report error when body has aria-hidden="true"', () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<body aria-hidden="true"></body>');
		expect(report).toBeInvalid();
		expect(report).toHaveError("aria-hidden-body", "aria-hidden must not be used on <body>");
	});

	it("should report error when body has dynamic aria-hidden value", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<body dynamic-aria-hidden="foo"></body>', {
			processAttribute,
		});
		expect(report).toBeInvalid();
		expect(report).toHaveError("aria-hidden-body", "aria-hidden must not be used on <body>");
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("aria-hidden-body")).toMatchSnapshot();
	});
});
