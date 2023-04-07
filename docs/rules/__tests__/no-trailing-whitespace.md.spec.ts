import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<p>lorem ipsum</p>  
<p>dolor sit amet</p>`;
markup["correct"] = `<p>lorem ipsum</p>
<p>dolor sit amet</p>`;

describe("docs/rules/no-trailing-whitespace.md", () => {
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-trailing-whitespace":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-trailing-whitespace":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
