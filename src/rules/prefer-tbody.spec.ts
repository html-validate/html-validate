import { beforeAll, describe, expect, it } from "@jest/globals";
import { HtmlValidate } from "../htmlvalidate";
import "html-validate/jest";

describe("rule prefer-tbody", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "prefer-tbody": "error" },
		});
	});

	it("should not report error when <table> has all <tr> wrapped in <tbody>", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<tbody>
					<tr></tr>
				</tbody>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when <table> has no <tr>", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <table></table> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when <table> has <tr> without <tbody>", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<table>
				<tr></tr>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Prefer to wrap <tr> elements in <tbody> (prefer-tbody)
			  1 |
			  2 | 			<table>
			> 3 | 				<tr></tr>
			    | 				 ^^
			  4 | 			</table>
			  5 |
			Selector: table > tr"
		`);
	});

	it("should report table as related", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<table id="tbl">
			<tr></tr>
		</table>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report.results[0].messages[0].related).toEqual([{ kind: "element", selector: "#tbl" }]);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("prefer-tbody");
		expect(docs).toMatchSnapshot();
	});
});
