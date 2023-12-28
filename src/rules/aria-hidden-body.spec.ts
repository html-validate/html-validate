import { HtmlValidate } from "../htmlvalidate";
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

	it("should not report error for other elements", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<div aria-hidden="true"></div>');
		expect(report).toBeValid();
	});

	it("should not report error when body is missing aria-hidden attribute", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<body></body>");
		expect(report).toBeValid();
	});

	it("should not report error when body is missing aria-hidden value", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<body aria-hidden></div>");
		expect(report).toBeValid();
	});

	it("should not report error when body has invalid aria-hidden value", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<body aria-hidden="foobar">');
		expect(report).toBeValid();
	});

	it('should not report error when body has aria-hidden="false"', async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<body aria-hidden="false"></body>');
		expect(report).toBeValid();
	});

	it('should report error when body has aria-hidden="true"', async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString('<body aria-hidden="true"></body>');
		expect(report).toBeInvalid();
		expect(report).toHaveError("aria-hidden-body", "aria-hidden must not be used on <body>");
	});

	it("should report error when body has dynamic aria-hidden value", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString('<body dynamic-aria-hidden="foo"></body>', {
			processAttribute,
		});
		expect(report).toBeInvalid();
		expect(report).toHaveError("aria-hidden-body", "aria-hidden must not be used on <body>");
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("aria-hidden-body");
		expect(docs).toMatchSnapshot();
	});
});
