import { describe, expect, it } from "@jest/globals";
import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<div>
  <label for="foo">Lorem ipsum</label>
  <p id="foo">dolor sit amet</p>
</div>`;
markup["correct"] = `<div>
  <label for="foo">Lorem ipsum</label>
  <input type="text" id="foo" />
</div>`;

describe("docs/rules/valid-for.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"valid-for":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"valid-for":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
