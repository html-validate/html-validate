import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule aria-hidden-body", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "aria-hidden-body": "error" },
		});
	});

	it("should not report error for other elements", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div aria-hidden="true"></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when body is missing aria-hidden attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <body></body> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when body is missing aria-hidden value", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <body aria-hidden></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when body has invalid aria-hidden value", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <body aria-hidden="foobar"></body> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should not report error when body has aria-hidden="false"', async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <body aria-hidden="false"></body> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should report error when body has aria-hidden="true"', async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <body aria-hidden="true"></body> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: aria-hidden must not be used on <body> (aria-hidden-body) at inline:1:8:
			> 1 |  <body aria-hidden="true"></body>
			    |        ^^^^^^^^^^^
			Selector: body"
		`);
	});

	it("should report error when body has dynamic aria-hidden value", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <body dynamic-aria-hidden="foo"></body> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: aria-hidden must not be used on <body> (aria-hidden-body) at inline:1:8:
			> 1 |  <body dynamic-aria-hidden="foo"></body>
			    |        ^^^^^^^^^^^^^^^^^^^
			Selector: body"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("aria-hidden-body");
		expect(docs).toMatchSnapshot();
	});
});
