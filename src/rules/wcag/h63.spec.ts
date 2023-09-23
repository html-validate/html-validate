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
		const markup = /* HTML */ ` <th scope="col"></th> `;
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
		const markup = /* HTML */ ` <th dynamic-scope="expr"></th> `;
		const report = await htmlvalidate.validateString(markup, { processAttribute });
		expect(report).toBeValid();
	});

	it("should report error when th does not have scope", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <th></th> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at inline:1:3:
			> 1 |  <th></th>
			    |   ^^
			Selector: th"
		`);
	});

	it("should report error when th has empty scope", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<th scope></th>
			<th scope=""></th>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at inline:2:8:
			  1 |
			> 2 | 			<th scope></th>
			    | 			    ^^^^^
			  3 | 			<th scope=""></th>
			  4 |
			Selector: th:nth-child(1)
			error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at inline:3:8:
			  1 |
			  2 | 			<th scope></th>
			> 3 | 			<th scope=""></th>
			    | 			    ^^^^^
			  4 |
			Selector: th:nth-child(2)"
		`);
	});

	it("should report error when auto is used as keyword for th scope", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <th scope="auto"></th> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at inline:1:13:
			> 1 |  <th scope="auto"></th>
			    |             ^^^^
			Selector: th"
		`);
	});

	it("should report error when th has invalid scope", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <th scope="foobar"></th> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at inline:1:13:
			> 1 |  <th scope="foobar"></th>
			    |             ^^^^^^
			Selector: th"
		`);
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/wcag/h63.html");
		expect(report).toMatchInlineCodeframe(`
			"error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at test-files/rules/wcag/h63.html:8:2:
			   6 |
			   7 | <!-- invalid cases -->
			>  8 | <th></th>
			     |  ^^
			   9 | <th scope="auto"></th>
			  10 |
			Selector: th:nth-child(5)
			error: <th> element must have a valid scope attribute: row, col, rowgroup or colgroup (wcag/h63) at test-files/rules/wcag/h63.html:9:12:
			   7 | <!-- invalid cases -->
			   8 | <th></th>
			>  9 | <th scope="auto"></th>
			     |            ^^^^
			  10 |
			Selector: th:nth-child(6)"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getContextualDocumentation({ ruleId: "wcag/h63" });
		expect(docs).toMatchSnapshot();
	});
});
