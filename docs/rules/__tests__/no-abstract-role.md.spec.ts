import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<div role="landmark"></div>`;
markup["correct"] = `<div role="navigation"></div>`;

describe("docs/rules/no-abstract-role.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-abstract-role":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-abstract-role":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
