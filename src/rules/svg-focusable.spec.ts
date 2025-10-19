import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule svg-focusable", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "svg-focusable": "error" },
		});
	});

	it("should not report when <svg> has focusable attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<svg focusable="false"></svg>
			<svg focusable="true"></svg>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for other elements", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for boolean attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <svg focusable></svg> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when attributes use single quotes", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <svg></svg> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <svg> is missing required "focusable" attribute (svg-focusable) at inline:1:3:
			> 1 |  <svg></svg>
			    |   ^^^
			Selector: svg"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("svg-focusable");
		expect(docs).toMatchSnapshot();
	});
});
