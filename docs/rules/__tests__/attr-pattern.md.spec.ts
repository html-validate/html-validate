import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<p foo_bar="baz"></p>`;
markup["correct"] = `<p foo-bar="baz"></p>`;
markup["multiple"] = `<p foo-bar-123></p>
<p myprefix-foo_123!></p>`;

describe("docs/rules/attr-pattern.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"attr-pattern":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"attr-pattern":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: multiple", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"attr-pattern":["error",{"pattern":["[a-z0-9-]+","myprefix-.+"]}]}});
		const report = await htmlvalidate.validateString(markup["multiple"]);
		expect(report.results).toMatchSnapshot();
	});
});
