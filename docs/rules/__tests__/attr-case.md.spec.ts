import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<p ID="foo"></p>`;
markup["correct"] = `<p id="foo"></p>`;
markup["multiple"] = `<p foobar></p>
<p FOOBAR></p>
<p fooBar></p>`;
markup["svg-viewbox"] = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" />`;

describe("docs/rules/attr-case.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"attr-case":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"attr-case":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: multiple", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"attr-case":["error",{"style":["lowercase","uppercase"]}]}});
		const report = await htmlvalidate.validateString(markup["multiple"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: svg-viewbox", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"attr-case":"error"}});
		const report = await htmlvalidate.validateString(markup["svg-viewbox"]);
		expect(report.results).toMatchSnapshot();
	});
});
