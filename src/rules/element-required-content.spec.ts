import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule element-required-content", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "element-required-content": "error" },
			elements: [
				"html5",
				{
					"with-category": {
						requiredContent: ["@heading"],
					},
					"with-tagname": {
						requiredContent: ["p"],
					},
				},
			],
		});
	});

	it("should not report error when element has all required content", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<html>
				<head>
					<title></title>
				</head>
				<body></body>
			</html>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle unknown elements", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <missing-meta></missing-meta> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when element is missing required content", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<html>
				<body></body>
			</html>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <html> element must have <head> as content (element-required-content) at inline:2:5:
			  1 |
			> 2 | 			<html>
			    | 			 ^^^^
			  3 | 				<body></body>
			  4 | 			</html>
			  5 |
			Selector: html"
		`);
	});

	it("should report all errors when element is missing multiple content", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <html></html> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <html> element must have <head> as content (element-required-content) at inline:1:3:
			> 1 |  <html></html>
			    |   ^^^^
			Selector: html
			error: <html> element must have <body> as content (element-required-content) at inline:1:3:
			> 1 |  <html></html>
			    |   ^^^^
			Selector: html"
		`);
	});

	it("should format both tagnames and categories correct", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<with-tagname></with-tagname>
			<with-category></with-category>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <with-tagname> element must have <p> as content (element-required-content) at inline:2:5:
			  1 |
			> 2 | 			<with-tagname></with-tagname>
			    | 			 ^^^^^^^^^^^^
			  3 | 			<with-category></with-category>
			  4 |
			Selector: with-tagname
			error: <with-category> element must have heading element as content (element-required-content) at inline:3:5:
			  1 |
			  2 | 			<with-tagname></with-tagname>
			> 3 | 			<with-category></with-category>
			    | 			 ^^^^^^^^^^^^^
			  4 |
			Selector: with-category"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "element-required-content": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("element-required-content", null, {
			element: "<my-element>",
			missing: "<my-other-element>",
		});
		expect(docs).toMatchSnapshot();
	});
});
