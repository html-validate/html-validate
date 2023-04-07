import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<p style="color: red"></p>`;
markup["correct"] = `<p class="error"></p>`;
markup["allowed-properties"] = `<p style="display: none"></p>`;

describe("docs/rules/no-inline-style.md", () => {
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-inline-style":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-inline-style":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: allowed-properties", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-inline-style":"error"}});
		const report = htmlvalidate.validateString(markup["allowed-properties"]);
		expect(report.results).toMatchSnapshot();
	});
});
