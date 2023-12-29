import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule doctype-html", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "doctype-html": "error" },
		});
	});

	it("should not report when correct doctype is used", async () => {
		expect.assertions(1);
		const markup = /* RAW */ ` <!DOCTYPE html> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when doctype is uppercase", async () => {
		expect.assertions(1);
		const markup = /* RAW */ ` <!DOCTYPE HTML> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when older doctype is used", async () => {
		expect.assertions(2);
		const html =
			'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">';
		const report = await htmlvalidate.validateString(html);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: doctype should be "html" (doctype-html) at inline:1:11:
			> 1 | <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
			    |           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
			Selector: -"
		`);
	});

	it("should report error when doctype has legacy string", async () => {
		expect.assertions(2);
		const html = '<!DOCTYPE html SYSTEM "about:legacy-compat">';
		const report = await htmlvalidate.validateString(html);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: doctype should be "html" (doctype-html) at inline:1:11:
			> 1 | <!DOCTYPE html SYSTEM "about:legacy-compat">
			    |           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
			Selector: -"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("doctype-html");
		expect(docs).toMatchSnapshot();
	});
});
