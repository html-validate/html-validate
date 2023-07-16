import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<label for="foo">
  <input type="checkbox" id="foo">
  My fancy checkbox
</label>`;
markup["correct"] = `<!-- without for attribute -->
<label>
  <input type="checkbox">
  My fancy checkbox
</label>

<!-- without wrapping -->
<input type="checkbox" id="foo">
<label for="foo">
  My fancy checkbox
</label>`;

describe("docs/rules/no-redundant-for.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-redundant-for":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-redundant-for":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
