import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<head>
    <title></title>
</head>`;
markup["correct"] = `<head>
    <title>Lorem ipsum</title>
</head>`;
markup["whitespace"] = `<head>
    <title> </title>
</head>`;

describe("docs/rules/empty-title.md", () => {
	it("inline validation: incorrect", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"empty-title":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"empty-title":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: whitespace", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"empty-title":"error"}});
		const report = htmlvalidate.validateString(markup["whitespace"]);
		expect(report.results).toMatchSnapshot();
	});
});
