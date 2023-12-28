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
		expect(report).toHaveError("missing-doctype", "Document is missing doctype");
	});

	it("should not report error when document has doctype", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<!doctype html>
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
