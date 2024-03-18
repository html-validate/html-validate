import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<input name="foo-bar">`;
markup["correct"] = `<input name="fooBar">`;
markup["array-brackets"] = `<input name="fooBar[]">`;

describe("docs/rules/name-pattern.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"name-pattern":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"name-pattern":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: array-brackets", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"name-pattern":"error"}});
		const report = await htmlvalidate.validateString(markup["array-brackets"]);
		expect(report.results).toMatchSnapshot();
	});
});
