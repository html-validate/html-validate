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
			<ul>
				<li>foo
				<li>bar
			</ul>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Element <li> is implicitly closed by sibling (no-implicit-close) at inline:3:6:
			  1 |
			  2 | 			<ul>
			> 3 | 				<li>foo
			    | 				 ^^
			  4 | 				<li>bar
			  5 | 			</ul>
			  6 |
			Selector: ul > li:nth-child(1)
			error: Element <li> is implicitly closed by parent </ul> (no-implicit-close) at inline:4:6:
			  2 | 			<ul>
			  3 | 				<li>foo
			> 4 | 				<li>bar
			    | 				 ^^
			  5 | 			</ul>
			  6 |
			Selector: ul > li:nth-child(2)"
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

	it("should report error when element is implicitly closed by implicit document element end tag", async () => {
		expect.assertions(2);
		const markup = /* RAW */ `
			<p>foo
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
		"error: Element <p> is implicitly closed by document ending (no-implicit-close) at inline:2:5:
		  1 |
		> 2 | 			<p>foo
		    | 			 ^
		  3 |
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
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("no-implicit-close");
		expect(docs).toMatchSnapshot();
	});
});
