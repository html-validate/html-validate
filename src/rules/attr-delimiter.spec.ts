import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule attr-delimiter", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "attr-delimiter": ["error"] },
		});
	});

	it("should not report when attributes have proper delimiter", async () => {
		expect.assertions(1);
		const markup = `<i foo="1" bar='2'></i>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle boolean attributes", async () => {
		expect.assertions(1);
		const markup = "<i foo bar></i>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when equal sign has leading whitespace", async () => {
		expect.assertions(2);
		const markup = '<i foo ="1"></i>';
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Attribute value must not be delimited by whitespace (attr-delimiter) at inline:1:7:
			> 1 | <i foo ="1"></i>
			    |       ^^
			Selector: -"
		`);
	});

	it("should report error when equal sign has trailing whitespace", async () => {
		expect.assertions(2);
		const markup = '<i foo= "1"></i>';
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Attribute value must not be delimited by whitespace (attr-delimiter) at inline:1:7:
			> 1 | <i foo= "1"></i>
			    |       ^^
			Selector: -"
		`);
	});

	it("should handle single quote", async () => {
		expect.assertions(2);
		const markup = "<i foo = '1'></i>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Attribute value must not be delimited by whitespace (attr-delimiter) at inline:1:7:
			> 1 | <i foo = '1'></i>
			    |       ^^^
			Selector: -"
		`);
	});

	it("should handle unquoted value", async () => {
		expect.assertions(2);
		const markup = "<i foo = bar></i>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Attribute value must not be delimited by whitespace (attr-delimiter) at inline:1:7:
			> 1 | <i foo = bar></i>
			    |       ^^^
			Selector: -"
		`);
	});

	it("should handle spaces in value", async () => {
		expect.assertions(1);
		const markup = '<i foo=" foo bar "></i>';
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("attr-delimiter");
		expect(docs).toMatchSnapshot();
	});
});
