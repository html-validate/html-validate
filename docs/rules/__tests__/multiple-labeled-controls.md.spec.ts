import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect-multiple"] = `<label>
  <input type="text">
  <input type="text">
</label>`;
markup["incorrect-both"] = `<label for="bar">
  <input type="text" id="foo">
</label>
<input type="text" id="bar">`;
markup["correct"] = `<label>
  <input type="text">
</label>`;

describe("docs/rules/multiple-labeled-controls.md", () => {
	it("inline validation: incorrect-multiple", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"multiple-labeled-controls":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect-multiple"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: incorrect-both", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"multiple-labeled-controls":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect-both"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"multiple-labeled-controls":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
