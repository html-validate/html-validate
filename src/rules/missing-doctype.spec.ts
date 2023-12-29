import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule missing-doctype", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "missing-doctype": "error" },
		});
	});

	it("should report error when document is missing doctype", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <html></html> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Document is missing doctype (missing-doctype) at inline:1:1:
			> 1 |  <html></html>
			    | ^
			Selector: -"
		`);
	});

	it("should not report error when document has doctype (lowercase)", async () => {
		expect.assertions(1);
		const markup = /* RAW */ `
			<!doctype html>
			<html></html>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when document has doctype (uppercase)", async () => {
		expect.assertions(1);
		const markup = /* RAW */ `
			<!DOCTYPE html>
			<html></html>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/missing-doctype.html");
		expect(report).toMatchInlineCodeframe(`
			"error: Document is missing doctype (missing-doctype) at test-files/rules/missing-doctype.html:1:1:
			> 1 | <html>
			    | ^
			  2 | 	<head></head>
			  3 | 	<body></body>
			  4 | </html>
			Selector: -"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("missing-doctype");
		expect(docs).toMatchSnapshot();
	});
});
