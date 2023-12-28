import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-deprecated-attr", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-deprecated-attr": "error" },
		});
	});

	it("should not report when regular element is used", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <body style="background: red;"></body> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when regular element is missing meta", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <any style="background: red;"></any> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when regular element has no deprecated attributes", async () => {
		expect.assertions(1);
		/* use custom meta as html5 has global deprecations */
		const htmlvalidate = new HtmlValidate({
			elements: [{ abbr: {} }],
			rules: { "no-deprecated-attr": "error" },
		});
		const markup = /* HTML */ ` <abbr style="background: red;"></abbr> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when deprecated attribute is used", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <body bgcolor="red"></body> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-deprecated-attr",
			'Attribute "bgcolor" is deprecated on <body> element',
		);
	});

	it("should report error when deprecated attribute is used in any case", async () => {
		expect.assertions(2);
		const markup = /* RAW */ ` <body BGCOLOR="red"></body> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-deprecated-attr",
			'Attribute "BGCOLOR" is deprecated on <body> element',
		);
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/no-deprecated-attr.html");
		expect(report).toMatchInlineCodeframe(`
			"error: Attribute "bgcolor" is deprecated on <body> element (no-deprecated-attr) at test-files/rules/no-deprecated-attr.html:2:7:
			  1 | <body></body>
			> 2 | <body bgcolor="red"></body>
			    |       ^^^^^^^
			  3 | <body BGCOLOR="red"></body>
			  4 | <body bgColor="red"></body>
			  5 |
			Selector: body:nth-child(2)
			error: Attribute "BGCOLOR" is deprecated on <body> element (no-deprecated-attr) at test-files/rules/no-deprecated-attr.html:3:7:
			  1 | <body></body>
			  2 | <body bgcolor="red"></body>
			> 3 | <body BGCOLOR="red"></body>
			    |       ^^^^^^^
			  4 | <body bgColor="red"></body>
			  5 |
			  6 | <table valign="top">
			Selector: body:nth-child(3)
			error: Attribute "bgColor" is deprecated on <body> element (no-deprecated-attr) at test-files/rules/no-deprecated-attr.html:4:7:
			  2 | <body bgcolor="red"></body>
			  3 | <body BGCOLOR="red"></body>
			> 4 | <body bgColor="red"></body>
			    |       ^^^^^^^
			  5 |
			  6 | <table valign="top">
			  7 | 	<tr background="blue">
			Selector: body:nth-child(4)
			error: Attribute "background" is deprecated on <tr> element (no-deprecated-attr) at test-files/rules/no-deprecated-attr.html:7:6:
			   5 |
			   6 | <table valign="top">
			>  7 | 	<tr background="blue">
			     | 	    ^^^^^^^^^^
			   8 | 		<td align="right">foo</td>
			   9 | 	</tr>
			  10 | </table>
			Selector: table > tr
			error: Attribute "align" is deprecated on <td> element (no-deprecated-attr) at test-files/rules/no-deprecated-attr.html:8:7:
			   6 | <table valign="top">
			   7 | 	<tr background="blue">
			>  8 | 		<td align="right">foo</td>
			     | 		    ^^^^^
			   9 | 	</tr>
			  10 | </table>
			  11 |
			Selector: table > tr > td"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("no-deprecated-attr");
		expect(docs).toMatchSnapshot();
	});
});
