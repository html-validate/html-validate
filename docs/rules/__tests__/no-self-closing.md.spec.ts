import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<div/>`;
markup["correct"] = `<div></div>

<!-- foreign elements are ignored -->
<svg/>

<!-- elements with XML namespace are ignored -->
<xi:include/>`;
markup["foreign"] = `<svg/>`;
markup["xml"] = `<xi:include/>`;

describe("docs/rules/no-self-closing.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-self-closing":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-self-closing":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: foreign", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-self-closing":["error",{"ignoreForeign":false}]}});
		const report = await htmlvalidate.validateString(markup["foreign"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: xml", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-self-closing":["error",{"ignoreXML":false}]}});
		const report = await htmlvalidate.validateString(markup["xml"]);
		expect(report.results).toMatchSnapshot();
	});
});
