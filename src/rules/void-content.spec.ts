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
		const report = await htmlvalidate.validateString("<input>");
		expect(report).toBeValid();
	});

	it("should not report when void element is self-closed", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<input/>");
		expect(report).toBeValid();
	});

	it("should not report when non-void element has end tag", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<div></div>");
		expect(report).toBeValid();
	});

	it("should not report when non-void element is self-closed", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<div/>");
		expect(report).toBeValid();
	});

	it("should not report when unknown element is self-closed", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<custom-element/>");
		expect(report).toBeValid();
	});

	it("should not report when unknown element has end tag", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<custom-element></custom-element>");
		expect(report).toBeValid();
	});

	it("should not report when xml namespaces is used", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<xi:include/>");
		expect(report).toBeValid();
	});

	it("should report when void element has end tag", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<input></input>");
		expect(report).toHaveError("void-content", "End tag for <input> must be omitted", "input");
	});

	it("should handle stray end tag", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("</div>");
		expect(report).toBeValid();
	});

	it("should handle missing end tag", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<div>");
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
