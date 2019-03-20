import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<h1></h1>
<h2><span></span></h2>`;
markup["correct"] = `<h1>Lorem ipsum</h1>
<h2><span>Dolor sit amet</span></h2>`;
markup["whitespace"] = `<h1> </h1>`;

describe("docs/rules/empty-heading.md", () => {
	it("inline validation: incorrect", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"empty-heading":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"empty-heading":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: whitespace", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"empty-heading":"error"}});
		const report = htmlvalidate.validateString(markup["whitespace"]);
		expect(report.results).toMatchSnapshot();
	});
});
