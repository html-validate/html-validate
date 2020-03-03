import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<a download=""></a>`;
markup["correct"] = `<a download></a>`;

describe("docs/rules/attribute-empty-style.md", () => {
	it("inline validation: incorrect", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"attribute-empty-style":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"attribute-empty-style":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
