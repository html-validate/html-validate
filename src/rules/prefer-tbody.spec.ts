import { HtmlValidate } from "../htmlvalidate";
import "../jest";

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
			"error: Prefer to wrap <tr> elements in <tbody> (prefer-tbody) at inline:3:6:
			  1 |
			  2 | 			<table>
			> 3 | 				<tr></tr>
			    | 				 ^^
			  4 | 			</table>
			  5 |
			Selector: table > tr"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("prefer-tbody");
		expect(docs).toMatchSnapshot();
	});
});
