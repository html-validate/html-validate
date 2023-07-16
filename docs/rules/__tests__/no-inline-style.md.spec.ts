import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<p style="color: red"></p>`;
markup["correct"] = `<p class="error"></p>`;
markup["allowed-properties"] = `<p style="display: none"></p>`;

describe("docs/rules/no-inline-style.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-inline-style":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-inline-style":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: allowed-properties", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-inline-style":"error"}});
		const report = await htmlvalidate.validateString(markup["allowed-properties"]);
		expect(report.results).toMatchSnapshot();
	});
});
