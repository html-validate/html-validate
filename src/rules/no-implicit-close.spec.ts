import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-implicit-close", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-implicit-close": "error" },
		});
	});

	it("should not report when element is explicitly closed", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <li></li> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when element is implicitly closed by parent", async () => {
		expect.assertions(2);
		const markup = /* RAW */ `
			<ul>
				<li>foo
			</ul>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Element <li> is implicitly closed by parent </ul> (no-implicit-close) at inline:3:6:
			  1 |
			  2 | 			<ul>
			> 3 | 				<li>foo
			    | 				 ^^
			  4 | 			</ul>
			  5 |
			Selector: ul > li"
		`);
	});

	it("should report error when element is implicitly closed by sibling", async () => {
		expect.assertions(2);
		const markup = /* RAW */ `
			<li>foo
			<li>bar
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Element <li> is implicitly closed by sibling (no-implicit-close) at inline:2:5:
			  1 |
			> 2 | 			<li>foo
			    | 			 ^^
			  3 | 			<li>bar
			  4 |
			Selector: li:nth-child(1)"
		`);
	});

	it("should report error when element is implicitly closed by adjacent block element", async () => {
		expect.assertions(2);
		const markup = /* RAW */ `
			<p>foo
			<div>bar</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Element <p> is implicitly closed by adjacent <div> (no-implicit-close) at inline:2:5:
			  1 |
			> 2 | 			<p>foo
			    | 			 ^
			  3 | 			<div>bar</div>
			  4 |
			Selector: p"
		`);
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/no-implicit-close.html");
		expect(report).toMatchCodeframe();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("no-implicit-close");
		expect(docs).toMatchSnapshot();
	});
});
