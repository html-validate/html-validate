import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule element-permitted-occurrences", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "element-permitted-occurrences": "error" },
		});
	});

	it("should report error when child has too many occurrences", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<table>
				<caption>
					1
				</caption>
				<caption>
					2
				</caption>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Element <caption> can only appear once under <table> (element-permitted-occurrences) at inline:6:6:
			  4 | 					1
			  5 | 				</caption>
			> 6 | 				<caption>
			    | 				 ^^^^^^^
			  7 | 					2
			  8 | 				</caption>
			  9 | 			</table>
			Selector: table > caption:nth-child(2)"
		`);
	});

	it("should not report error when child has right number of occurrences", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<caption></caption>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when child has unrestricted number of occurrences", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<p>1</p>
				<p>2</p>
				<p>3</p>
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for elements without permittedContent", async () => {
		expect.assertions(1);
		const markup = "<a><p></p></a>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile(
			"test-files/rules/element-permitted-occurrences.html",
		);
		expect(report).toMatchInlineCodeframe(`
			"error: Element <caption> can only appear once under <table> (element-permitted-occurrences) at test-files/rules/element-permitted-occurrences.html:3:3:
			  1 | <table>
			  2 | 	<caption>1</caption>
			> 3 | 	<caption>2</caption>
			    | 	 ^^^^^^^
			  4 | </table>
			  5 |
			Selector: table > caption:nth-child(2)"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("element-permitted-occurrences");
		expect(docs).toMatchSnapshot();
	});
});
