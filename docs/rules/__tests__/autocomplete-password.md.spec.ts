import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<input type="password">
<input type="password" autocomplete="off">`;
markup["correct"] = `<input type="password" autocomplete="new-password">`;
markup["incorrect-preferred"] = `<input type="password" autocomplete="current-password">`;
markup["correct-preferred"] = `<input type="password" autocomplete="new-password">`;

describe("docs/rules/autocomplete-password.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"autocomplete-password":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"autocomplete-password":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: incorrect-preferred", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"autocomplete-password":["error",{"preferred":"new-password"}]}});
		const report = await htmlvalidate.validateString(markup["incorrect-preferred"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-preferred", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"autocomplete-password":["error",{"preferred":"new-password"}]}});
		const report = await htmlvalidate.validateString(markup["correct-preferred"]);
		expect(report.results).toMatchSnapshot();
	});
});
