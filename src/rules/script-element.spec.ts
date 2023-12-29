import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule script-element", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "script-element": "error" },
		});
	});

	it("should not report when script element has end tag", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <script></script> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report when script element is self-closed", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <script /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: End tag for <script> must not be omitted (script-element) at inline:1:10:
			> 1 |  <script />
			    |          ^^
			Selector: script"
		`);
	});

	it("should handle stray end tag", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` </script> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle missing end tag", async () => {
		expect.assertions(1);
		const markup = /* RAW */ `<script>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("script-element");
		expect(docs).toMatchSnapshot();
	});
});
