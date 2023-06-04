import { HtmlValidate } from "../../../src/htmlvalidate";

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
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"empty-title":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"empty-title":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: whitespace", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"empty-title":"error"}});
		const report = await htmlvalidate.validateString(markup["whitespace"]);
		expect(report.results).toMatchSnapshot();
	});
});
