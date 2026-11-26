import { beforeAll, describe, expect, it } from "@jest/globals";
import { HtmlValidate } from "../htmlvalidate";
import { type HtmlElementLike } from "../meta";
import "html-validate/jest";

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
			"error: Element <caption> can only appear once under <table> (element-permitted-occurrences)
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

	describe("conditional occurrence limits", () => {
		const validator = new HtmlValidate({
			root: true,
			elements: [
				"html5",
				{
					"my-box": {
						permittedContent: (node: HtmlElementLike) =>
							node.hasAttribute("limited") ? ["span?"] : ["span"],
					},
				},
			],
			rules: { "element-permitted-occurrences": "error" },
		});

		it("should not report when conditional content returns unrestricted occurrences", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<my-box>
					<span></span>
					<span></span>
				</my-box>
			`;
			const report = await validator.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report when conditional content returns restricted occurrences", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<my-box limited>
					<span></span>
					<span></span>
				</my-box>
			`;
			const report = await validator.validateString(markup);
			expect(report).toMatchInlineCodeframe(`
				"error: Element <span> can only appear once under <my-box> (element-permitted-occurrences)
				  2 | 				<my-box limited>
				  3 | 					<span></span>
				> 4 | 					<span></span>
				    | 					 ^^^^
				  5 | 				</my-box>
				  6 |
				Selector: my-box > span:nth-child(2)"
			`);
		});
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile(
			"test-files/rules/element-permitted-occurrences.html",
		);
		expect(report).toMatchInlineCodeframe(`
			"error: Element <caption> can only appear once under <table> (element-permitted-occurrences)
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
