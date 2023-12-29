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
		const markup = /* RAW */ ` <div></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report errors on self-closing tags", async () => {
		expect.assertions(1);
		const markup = /* RAW */ ` <input required /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report errors on void tags", async () => {
		expect.assertions(1);
		const markup = /* RAW */ ` <input required /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report when close tags contains attributes", async () => {
		expect.assertions(2);
		const markup = /* RAW */ `
			<p></p foo="bar">
			<p></p foo='bar'>
			<p></p foo>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Close tags cannot have attributes (close-attr) at inline:2:11:
			  1 |
			> 2 | 			<p></p foo="bar">
			    | 			       ^^^
			  3 | 			<p></p foo='bar'>
			  4 | 			<p></p foo>
			  5 |
			Selector: -
			error: Close tags cannot have attributes (close-attr) at inline:3:11:
			  1 |
			  2 | 			<p></p foo="bar">
			> 3 | 			<p></p foo='bar'>
			    | 			       ^^^
			  4 | 			<p></p foo>
			  5 |
			Selector: -
			error: Close tags cannot have attributes (close-attr) at inline:4:11:
			  2 | 			<p></p foo="bar">
			  3 | 			<p></p foo='bar'>
			> 4 | 			<p></p foo>
			    | 			       ^^^
			  5 |
			Selector: -"
		`);
	});

	it("should handle unclosed tags", async () => {
		expect.assertions(1);
		const markup = /* RAW */ ` <p> `;
		const report = await htmlvalidate.validateString(markup);
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
