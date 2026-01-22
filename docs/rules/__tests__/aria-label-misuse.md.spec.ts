import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<input type="hidden" aria-label="foobar">`;
markup["correct"] = `<input type="text" aria-label="foobar">`;
markup["any-namable"] = `<h1 aria-label="Lorem ipsum">dolor sit amet</h1>`;
markup["elements-include"] = `<!-- div is validated and will report an error -->
<div aria-label="Lorem ipsum">dolor sit amet</div>

   <!-- p is ignored, no error despite normally not being allowed -->
   <p aria-label="Lorem ipsum">dolor sit amet</p>`;
markup["elements-exclude"] = `<!-- div is validated and will report an error -->
<div aria-label="Lorem ipsum">dolor sit amet</div>

   <!-- p is ignored, no error despite normally not being allowed -->
   <p aria-label="Lorem ipsum">dolor sit amet</p>`;

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
	it("inline validation: elements-include", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"aria-label-misuse":["error",{"elements":{"include":["div"]}}]}});
		const report = await htmlvalidate.validateString(markup["elements-include"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: elements-exclude", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"aria-label-misuse":["error",{"elements":{"exclude":["p"]}}]}});
		const report = await htmlvalidate.validateString(markup["elements-exclude"]);
		expect(report.results).toMatchSnapshot();
	});
});
