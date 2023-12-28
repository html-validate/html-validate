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
		expect(report).toHaveError("prefer-tbody", "Prefer to wrap <tr> elements in <tbody>");
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("prefer-tbody");
		expect(docs).toMatchSnapshot();
	});
});
