import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<input type="text" autocomplete="foo">
<input type="text" autocomplete="name billing">
<input type="text" autocomplete="street-address">`;
markup["correct"] = `<input type="text" autocomplete="name">
<input type="text" autocomplete="billing name">
<textarea autocomplete="street-address"></textarea>`;

describe("docs/rules/valid-autocomplete.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"valid-autocomplete":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"valid-autocomplete":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
