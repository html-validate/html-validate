import { HtmlValidate } from "../../htmlvalidate";
import { processAttribute } from "../../transform/mocks/attribute";
import "../../jest";

describe("wcag/h63", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "wcag/h63": "error" },
		});
	});

	it("should not report when th has scope attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<tr>
					<th scope="col"></th>
				</tr>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for other elements", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when th has dynamic scope attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<tr>
					<th dynamic-scope="expr"></th>
				</tr>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup, { processAttribute });
		expect(report).toBeValid();
	});

	it("should report error when th does not have scope", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<tr>
					<th></th>
				</tr>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at inline:4:7:
			  2 | 			<table>
			  3 | 				<tr>
			> 4 | 					<th></th>
			    | 					 ^^
			  5 | 				</tr>
			  6 | 			</table>
			  7 |
			Selector: table > tr > th"
		`);
	});

	it("should report error when th has empty scope", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<tr>
					<th scope></th>
					<th scope=""></th>
				</tr>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at inline:4:10:
			  2 | 			<table>
			  3 | 				<tr>
			> 4 | 					<th scope></th>
			    | 					    ^^^^^
			  5 | 					<th scope=""></th>
			  6 | 				</tr>
			  7 | 			</table>
			Selector: table > tr > th:nth-child(1)
			error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at inline:5:10:
			  3 | 				<tr>
			  4 | 					<th scope></th>
			> 5 | 					<th scope=""></th>
			    | 					    ^^^^^
			  6 | 				</tr>
			  7 | 			</table>
			  8 |
			Selector: table > tr > th:nth-child(2)"
		`);
	});

	it("should report error when auto is used as keyword for th scope", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<tr>
					<th scope="auto"></th>
				</tr>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at inline:4:17:
			  2 | 			<table>
			  3 | 				<tr>
			> 4 | 					<th scope="auto"></th>
			    | 					           ^^^^
			  5 | 				</tr>
			  6 | 			</table>
			  7 |
			Selector: table > tr > th"
		`);
	});

	it("should report error when th has invalid scope", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<tr>
					<th scope="foobar"></th>
				</tr>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at inline:4:17:
			  2 | 			<table>
			  3 | 				<tr>
			> 4 | 					<th scope="foobar"></th>
			    | 					           ^^^^^^
			  5 | 				</tr>
			  6 | 			</table>
			  7 |
			Selector: table > tr > th"
		`);
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/wcag/h63.html");
		expect(report).toMatchInlineCodeframe(`
			"error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at test-files/rules/wcag/h63.html:10:4:
			   8 |
			   9 | 		<!-- invalid cases -->
			> 10 | 		<th></th>
			     | 		 ^^
			  11 | 		<th scope="auto"></th>
			  12 | 	</tr>
			  13 | </table>
			Selector: table > tr > th:nth-child(5)
			error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at test-files/rules/wcag/h63.html:11:14:
			   9 | 		<!-- invalid cases -->
			  10 | 		<th></th>
			> 11 | 		<th scope="auto"></th>
			     | 		           ^^^^
			  12 | 	</tr>
			  13 | </table>
			  14 |
			Selector: table > tr > th:nth-child(6)"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getContextualDocumentation({ ruleId: "wcag/h63" });
		expect(docs).toMatchSnapshot();
	});
});
