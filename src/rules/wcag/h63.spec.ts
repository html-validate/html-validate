import { HtmlValidate } from "../../htmlvalidate";
import { processAttribute } from "../../transform/mocks/attribute";
import "../../jest";
import { Parser } from "../../parser";
import { Config } from "../../config";
import { isSimpleTable } from "./h63";

describe("isSimpleTable()", () => {
	let parser: Parser;

	beforeAll(async () => {
		const config = Config.empty();
		parser = new Parser(await config.resolve());
	});

	describe("headers in first row", () => {
		it("should return true for table with headings in first row (implicit tbody)", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<table>
					<tr>
						<th>1</th>
						<th>2</th>
						<th>3</th>
					</tr>
					<tr>
						<td>a</td>
						<td>a</td>
						<td>a</td>
					</tr>
				</table>
			`;
			const document = parser.parseHtml(markup);
			const result = isSimpleTable(document.querySelector("table")!);
			expect(result).toBe(true);
		});

		it("should return true for table with headings in first thead row", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<table>
					<thead>
						<tr>
							<th>1</th>
							<th>2</th>
							<th>3</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>a</td>
							<td>a</td>
							<td>a</td>
						</tr>
					</tbody>
				</table>
			`;
			const document = parser.parseHtml(markup);
			const result = isSimpleTable(document.querySelector("table")!);
			expect(result).toBe(true);
		});

		it("should return true for table with headings in first tbody row", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<table>
					<tbody>
						<tr>
							<th>1</th>
							<th>2</th>
							<th>3</th>
						</tr>
						<tr>
							<td>a</td>
							<td>a</td>
							<td>a</td>
						</tr>
					</tbody>
				</table>
			`;
			const document = parser.parseHtml(markup);
			const result = isSimpleTable(document.querySelector("table")!);
			expect(result).toBe(true);
		});

		it("should return false for table with headings in both thead and tbody", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<table>
					<thead>
						<tr>
							<th>1</th>
							<th>2</th>
							<th>3</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<th>1</th>
							<th>2</th>
							<th>3</th>
						</tr>
						<tr>
							<td>a</td>
							<td>a</td>
							<td>a</td>
						</tr>
					</tbody>
				</table>
			`;
			const document = parser.parseHtml(markup);
			const result = isSimpleTable(document.querySelector("table")!);
			expect(result).toBe(false);
		});

		it("should return false for table with have thead but headings in tbody", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<table>
					<thead>
						<tr>
							<td>1</td>
							<td>2</td>
							<td>3</td>
						</tr>
					</thead>
					<tbody>
						<tr>
							<th>1</th>
							<th>2</th>
							<th>3</th>
						</tr>
						<tr>
							<td>a</td>
							<td>a</td>
							<td>a</td>
						</tr>
					</tbody>
				</table>
			`;
			const document = parser.parseHtml(markup);
			const result = isSimpleTable(document.querySelector("table")!);
			expect(result).toBe(false);
		});

		it("should return false for table where not all columns are headers", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<table>
					<thead>
						<tr>
							<th>1</th>
							<th>2</th>
							<td>3</td>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>a</td>
							<td>a</td>
							<td>a</td>
						</tr>
					</tbody>
				</table>
			`;
			const document = parser.parseHtml(markup);
			const result = isSimpleTable(document.querySelector("table")!);
			expect(result).toBe(false);
		});
	});

	describe("headers in first column", () => {
		it("should return true for table with headings in first column (implicit tbody)", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<table>
					<tr>
						<th>1</th>
						<td>a</td>
						<td>b</td>
					</tr>
					<tr>
						<th>2</th>
						<td>c</td>
						<td>d</td>
					</tr>
				</table>
			`;
			const document = parser.parseHtml(markup);
			const result = isSimpleTable(document.querySelector("table")!);
			expect(result).toBe(true);
		});

		it("should return true for table with headings in first column with tbody", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<table>
					<tbody>
						<tr>
							<th>1</th>
							<td>a</td>
							<td>b</td>
						</tr>
						<tr>
							<th>2</th>
							<td>c</td>
							<td>d</td>
						</tr>
					</tbody>
				</table>
			`;
			const document = parser.parseHtml(markup);
			const result = isSimpleTable(document.querySelector("table")!);
			expect(result).toBe(true);
		});

		it("should return false for table with thead", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<table>
					<thead>
						<tr>
							<th>1</th>
							<td>a</td>
							<td>b</td>
						</tr>
					</thead>
					<tbody>
						<tr>
							<th>2</th>
							<td>c</td>
							<td>d</td>
						</tr>
					</tbody>
				</table>
			`;
			const document = parser.parseHtml(markup);
			const result = isSimpleTable(document.querySelector("table")!);
			expect(result).toBe(false);
		});

		it("should return false for table if not all rows have heading", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<table>
					<tr>
						<th>1</th>
						<td>a</td>
						<td>b</td>
					</tr>
					<tr>
						<th>2</th>
						<td>c</td>
						<td>d</td>
					</tr>
					<tr>
						<td>3</td>
						<td>e</td>
						<td>f</td>
					</tr>
				</table>
			`;
			const document = parser.parseHtml(markup);
			const result = isSimpleTable(document.querySelector("table")!);
			expect(result).toBe(false);
		});

		it("should return false for table with headings in other columns", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<table>
					<tbody>
						<tr>
							<td>a</td>
							<th>1</th>
							<td>b</td>
						</tr>
						<tr>
							<td>c</td>
							<th>2</th>
							<td>d</td>
						</tr>
						<tr>
							<td>e</td>
							<th>3</th>
							<td>f</td>
						</tr>
					</tbody>
				</table>
			`;
			const document = parser.parseHtml(markup);
			const result = isSimpleTable(document.querySelector("table")!);
			expect(result).toBe(false);
		});
	});

	it("should return false if any cell uses the headings attribute", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<tr>
					<th id="foo">1</th>
					<th>2</th>
					<th>3</th>
				</tr>
				<tr>
					<td headers="foo">a</td>
					<td>a</td>
					<td>a</td>
				</tr>
			</table>
		`;
		const document = parser.parseHtml(markup);
		const result = isSimpleTable(document.querySelector("table")!);
		expect(result).toBe(false);
	});

	it("should return false for table without rows", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <table></table> `;
		const document = parser.parseHtml(markup);
		const result = isSimpleTable(document.querySelector("table")!);
		expect(result).toBe(false);
	});

	it("should return false for thead without rows", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<thead></thead>
			</table>
		`;
		const document = parser.parseHtml(markup);
		const result = isSimpleTable(document.querySelector("table")!);
		expect(result).toBe(false);
	});

	it("should return false for tbody without rows", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<tbody></tbody>
			</table>
		`;
		const document = parser.parseHtml(markup);
		const result = isSimpleTable(document.querySelector("table")!);
		expect(result).toBe(false);
	});

	it("should return false for tr without cells", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<tr></tr>
			</table>
		`;
		const document = parser.parseHtml(markup);
		const result = isSimpleTable(document.querySelector("table")!);
		expect(result).toBe(false);
	});

	it("should handle when column count is mismatched (less)", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<tr>
					<th>1</th>
					<th>2</th>
					<th>3</th>
				</tr>
				<tr>
					<td>a</td>
					<td>b</td>
				</tr>
			</table>
		`;
		const document = parser.parseHtml(markup);
		const result = isSimpleTable(document.querySelector("table")!);
		expect(result).toBe(false);
	});

	it("should handle when column count is mismatched (more)", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<tr>
					<th>1</th>
					<th>2</th>
					<th>3</th>
				</tr>
				<tr>
					<td>a</td>
					<td>b</td>
					<td>c</td>
					<td>d</td>
				</tr>
			</table>
		`;
		const document = parser.parseHtml(markup);
		const result = isSimpleTable(document.querySelector("table")!);
		expect(result).toBe(false);
	});

	it("should handle nested table", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<caption>
					Simple table
				</caption>
				<tr>
					<th></th>
				</tr>
				<tr>
					<td>
						<table>
							<caption>
								Complex table
							</caption>
							<tr>
								<th></th>
								<th></th>
							</tr>
							<tr>
								<th></th>
								<td></td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		`;
		const document = parser.parseHtml(markup);
		const result = isSimpleTable(document.querySelector("table")!);
		expect(result).toBe(true);
	});
});

describe("wcag/h63", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "wcag/h63": "error" },
		});
	});

	it("should not report error when simple table has omitted scope attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<!-- all headers in first row -->
			<table>
				<tr>
					<th>a</th>
					<th>b</th>
					<th>c</th>
				</tr>
				<tr>
					<td>1</td>
					<td>2</td>
					<td>3</td>
				</tr>
			</table>

			<!-- all headers in first column -->
			<table>
				<tr>
					<th>a</th>
					<th>b</th>
					<th>c</th>
				</tr>
				<tr>
					<td>1</td>
					<td>2</td>
					<td>3</td>
				</tr>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when th has dynamic scope attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<thead>
					<tr>
						<!-- force complex table -->
						<th scope="col"></th>
						<th scope="col"></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th dynamic-scope="expr"></th>
						<td></td>
					</tr>
				</tbody>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup, { processAttribute });
		expect(report).toBeValid();
	});

	it("should report error when th does not have scope", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<thead>
					<tr>
						<!-- force complex table -->
						<th scope="col"></th>
						<th scope="col"></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th></th>
						<td></td>
					</tr>
				</tbody>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at inline:12:8:
			  10 | 				<tbody>
			  11 | 					<tr>
			> 12 | 						<th></th>
			     | 						 ^^
			  13 | 						<td></td>
			  14 | 					</tr>
			  15 | 				</tbody>
			Selector: table > tbody > tr > th"
		`);
	});

	it("should report error when th has empty scope", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<thead>
					<tr>
						<!-- force complex table -->
						<th scope="col"></th>
						<th scope="col"></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th scope></th>
						<th scope=""></th>
					</tr>
				</tbody>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at inline:12:11:
			  10 | 				<tbody>
			  11 | 					<tr>
			> 12 | 						<th scope></th>
			     | 						    ^^^^^
			  13 | 						<th scope=""></th>
			  14 | 					</tr>
			  15 | 				</tbody>
			Selector: table > tbody > tr > th:nth-child(1)
			error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at inline:13:11:
			  11 | 					<tr>
			  12 | 						<th scope></th>
			> 13 | 						<th scope=""></th>
			     | 						    ^^^^^
			  14 | 					</tr>
			  15 | 				</tbody>
			  16 | 			</table>
			Selector: table > tbody > tr > th:nth-child(2)"
		`);
	});

	it("should report error when auto is used as keyword for th scope", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<thead>
					<tr>
						<!-- force complex table -->
						<th scope="col"></th>
						<th scope="col"></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th scope="auto"></th>
						<td></td>
					</tr>
				</tbody>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at inline:12:18:
			  10 | 				<tbody>
			  11 | 					<tr>
			> 12 | 						<th scope="auto"></th>
			     | 						           ^^^^
			  13 | 						<td></td>
			  14 | 					</tr>
			  15 | 				</tbody>
			Selector: table > tbody > tr > th"
		`);
	});

	it("should report error when th has invalid scope", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<thead>
					<tr>
						<!-- force complex table -->
						<th scope="col"></th>
						<th scope="col"></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th scope="foobar"></th>
						<td></td>
					</tr>
				</tbody>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at inline:12:18:
			  10 | 				<tbody>
			  11 | 					<tr>
			> 12 | 						<th scope="foobar"></th>
			     | 						           ^^^^^^
			  13 | 						<td></td>
			  14 | 					</tr>
			  15 | 				</tbody>
			Selector: table > tbody > tr > th"
		`);
	});

	it("should report error when table with colspan is missing scope", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<thead>
					<tr>
						<!-- force complex table -->
						<th scope="col"></th>
						<th scope="col"></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th colspan="2"></th>
					</tr>
				</tbody>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at inline:12:8:
			  10 | 				<tbody>
			  11 | 					<tr>
			> 12 | 						<th colspan="2"></th>
			     | 						 ^^
			  13 | 					</tr>
			  14 | 				</tbody>
			  15 | 			</table>
			Selector: table > tbody > tr > th"
		`);
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "wcag/h63": "error" },
		});
		const report = await htmlvalidate.validateFile("test-files/rules/wcag/h63.html");
		expect(report).toMatchInlineCodeframe(`
			"error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at test-files/rules/wcag/h63.html:22:5:
			  20 |
			  21 | 			<!-- invalid cases -->
			> 22 | 			<th></th>
			     | 			 ^^
			  23 | 			<th scope="auto"></th>
			  24 | 		</tr>
			  25 | 	</tbody>
			Selector: table > tbody > tr > th:nth-child(5)
			error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at test-files/rules/wcag/h63.html:23:15:
			  21 | 			<!-- invalid cases -->
			  22 | 			<th></th>
			> 23 | 			<th scope="auto"></th>
			     | 			           ^^^^
			  24 | 		</tr>
			  25 | 	</tbody>
			  26 | </table>
			Selector: table > tbody > tr > th:nth-child(6)"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "wcag/h63": "error" },
		});
		const docs = await htmlvalidate.getContextualDocumentation({ ruleId: "wcag/h63" });
		expect(docs).toMatchSnapshot();
	});
});
