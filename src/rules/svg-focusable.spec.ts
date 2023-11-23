import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule svg-focusable", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "svg-focusable": "error" },
		});
	});

	it("should not report when <svg> has focusable attribute", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString(
			['<svg focusable="false"></svg>', '<svg focusable="true"></svg>'].join("\n"),
		);
		expect(report).toBeValid();
	});

	it("should not report for other elements", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<div></div>");
		expect(report).toBeValid();
	});

	it("should not report for boolean attribute", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<svg focusable></svg>");
		expect(report).toBeValid();
	});

	it("should report error when attributes use single quotes", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<svg></svg>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("svg-focusable", '<svg> is missing required "focusable" attribute');
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("svg-focusable");
		expect(docs).toMatchSnapshot();
	});
});
