import HtmlValidate from "../../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<a><img src="cat.gif"></a>`;
markup["correct"] = `<a>lorem ipsum</a>
<a><img src="cat.gif" alt="cat page"></a>`;

describe("docs/rules/wcag/h30.md", () => {
	it("inline validation: incorrect", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h30":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h30":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
