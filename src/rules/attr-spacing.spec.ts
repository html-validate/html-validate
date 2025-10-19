import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule attr-spacing", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "attr-spacing": ["error"] },
		});
	});

	it("should not report when attributes have separating whitespace", async () => {
		expect.assertions(1);
		const markup = '<i foo="1" bar="2"></i>';
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle boolean attributes", async () => {
		expect.assertions(1);
		const markup = "<i foo bar></i>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle newline attributes", async () => {
		expect.assertions(1);
		const markup = "<i foo\nbar></i>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when attributes does not have separating whitespace", async () => {
		expect.assertions(2);
		const markup = '<i foo="1"bar="2"></i>';
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: No space between attributes (attr-spacing) at inline:1:11:
			> 1 | <i foo="1"bar="2"></i>
			    |           ^^^
			Selector: -"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("attr-spacing");
		expect(docs).toMatchSnapshot();
	});
});
