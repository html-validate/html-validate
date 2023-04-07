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

	it("should not report when <main> is missing", () => {
		expect.assertions(1);
		const markup = "<p></p>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when single <main> is present", () => {
		expect.assertions(1);
		const markup = "<main></main>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when other <main> are hidden", () => {
		expect.assertions(1);
		const markup = "<main>a</main><main hidden>b</main>";
		const report = htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should not report when all <main> are hidden", () => {
		expect.assertions(1);
		const markup = "<main hidden>a</main><main hidden>b</main>";
		const report = htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report when multiple <main> are visible", () => {
		expect.assertions(2);
		const markup = "<main>a</main><main>b</main>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-multiple-main", "Multiple <main> elements present in document");
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("no-multiple-main")).toMatchSnapshot();
	});
});
