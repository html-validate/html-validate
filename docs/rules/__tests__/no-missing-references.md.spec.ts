import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<label for="missing-input"></label>
<div aria-labelledby="missing-text"></div>
<div aria-describedby="missing-text"></div>`;
markup["correct"] = `<label for="my-input"></label>
<div id="verbose-text"></div>
<div aria-labelledby="verbose-text"></div>
<div aria-describedby="verbose-text"></div>
<input id="my-input">`;

describe("docs/rules/no-missing-references.md", () => {
	it("inline validation: incorrect", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-missing-references":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-missing-references":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
