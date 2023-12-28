import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule void-content", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "void-content": "error" },
		});
	});

	it("should not report when void element omitted end tag", async () => {
		expect.assertions(1);
		const markup = /* RAW */ ` <input> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when void element is self-closed", async () => {
		expect.assertions(1);
		const markup = /* RAW */ ` <input /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when non-void element has end tag", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when non-void element is self-closed", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when unknown element is self-closed", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <custom-element /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when unknown element has end tag", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <custom-element></custom-element> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when xml namespaces is used", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <xi:include /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report when void element has end tag", async () => {
		expect.assertions(1);
		const markup = /* RAW */ ` <input></input> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toHaveError("void-content", "End tag for <input> must be omitted", "input");
	});

	it("should handle stray end tag", async () => {
		expect.assertions(1);
		const markup = /* RAW */ ` </div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle missing end tag", async () => {
		expect.assertions(1);
		const markup = /* RAW */ ` <div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("void-content");
		expect(docs).toMatchSnapshot();
	});

	it("should provide contextual documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("void-content", null, "foo");
		expect(docs).toMatchSnapshot();
	});
});
