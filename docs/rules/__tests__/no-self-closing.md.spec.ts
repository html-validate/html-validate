import HtmlValidate from "../../../src/htmlvalidate";

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
	it("inline validation: incorrect", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-self-closing":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-self-closing":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: foreign", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-self-closing":["error",{"ignoreForeign":false}]}});
		const report = htmlvalidate.validateString(markup["foreign"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: xml", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-self-closing":["error",{"ignoreXML":false}]}});
		const report = htmlvalidate.validateString(markup["xml"]);
		expect(report.results).toMatchSnapshot();
	});
});
