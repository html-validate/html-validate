import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import "../jest";

describe("rule no-multiple-main", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-multiple-main": "error" },
		});
	});

	it("should not report when <main> is missing", async () => {
		expect.assertions(1);
		const markup = "<p></p>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when single <main> is present", async () => {
		expect.assertions(1);
		const markup = "<main></main>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when other <main> are hidden", async () => {
		expect.assertions(1);
		const markup = "<main>a</main><main hidden>b</main>";
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should not report when all <main> are hidden", async () => {
		expect.assertions(1);
		const markup = "<main hidden>a</main><main hidden>b</main>";
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report when multiple <main> are visible", async () => {
		expect.assertions(2);
		const markup = "<main>a</main><main>b</main>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-multiple-main", "Multiple <main> elements present in document");
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("no-multiple-main");
		expect(docs).toMatchSnapshot();
	});
});
