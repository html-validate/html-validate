import { HtmlValidate } from "../../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<img>`;
markup["correct"] = `<img alt="...">`;
markup["allow-empty"] = `<span>The task was successfully completed! <img src="thumbsup.png" alt=""></span>`;
markup["alias"] = `<img data-alt="...">`;

describe("docs/rules/wcag/h37.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h37":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h37":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: allow-empty", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h37":["error",{"allowEmpty":true}]}});
		const report = await htmlvalidate.validateString(markup["allow-empty"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: alias", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h37":["error",{"alias":["data-alt"]}]}});
		const report = await htmlvalidate.validateString(markup["alias"]);
		expect(report.results).toMatchSnapshot();
	});
});
