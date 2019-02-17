import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<p ID="foo"></p>`;
markup["correct"] = `<p id="foo"></p>`;
markup["svg-viewbox"] = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" />`;

describe("docs/rules/attr-case.md", () => {
	it("inline validation: incorrect", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"attr-case":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"attr-case":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: svg-viewbox", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"attr-case":"error"}});
		const report = htmlvalidate.validateString(markup["svg-viewbox"]);
		expect(report.results).toMatchSnapshot();
	});
});
