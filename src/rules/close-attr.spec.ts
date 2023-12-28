import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule close-attr", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "close-attr": "error" },
		});
	});

	it("should not report when close tags are correct", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<div></div>");
		expect(report).toBeValid();
	});

	it("should not report errors on self-closing tags", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<input required/>");
		expect(report).toBeValid();
	});

	it("should not report errors on void tags", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<input required>");
		expect(report).toBeValid();
	});

	it("should report when close tags contains attributes", async () => {
		expect.assertions(2);
		const html = "<p></p foo=\"bar\"><p></p foo='bar'><p></p foo>";
		const report = await htmlvalidate.validateString(html);
		expect(report).toBeInvalid();
		expect(report).toHaveErrors([
			["close-attr", "Close tags cannot have attributes"],
			["close-attr", "Close tags cannot have attributes"],
			["close-attr", "Close tags cannot have attributes"],
		]);
	});

	it("should handle unclosed tags", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<p>");
		expect(report).toBeValid();
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/close-attr.html");
		expect(report).toMatchInlineCodeframe(`
			"error: Close tags cannot have attributes (close-attr) at test-files/rules/close-attr.html:3:12:
			  1 | <input foo>
			  2 | <hr bar/>
			> 3 | <div></div baz>
			    |            ^^^
			  4 |
			Selector: -"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("close-attr");
		expect(docs).toMatchSnapshot();
	});
});
