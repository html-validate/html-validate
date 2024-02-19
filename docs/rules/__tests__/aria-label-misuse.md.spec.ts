import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<input type="hidden" aria-label="foobar">`;
markup["correct"] = `<input type="text" aria-label="foobar">`;
markup["any-namable"] = `<h1 aria-label="Lorem ipsum">dolor sit amet</h1>`;

describe("docs/rules/aria-label-misuse.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"aria-label-misuse":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"aria-label-misuse":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: any-namable", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"aria-label-misuse":["error",{"allowAnyNamable":true}]}});
		const report = await htmlvalidate.validateString(markup["any-namable"]);
		expect(report.results).toMatchSnapshot();
	});
});
