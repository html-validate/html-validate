import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<p id=""></p>
<p id="foo bar"></p>
<p id="123"></p>`;
markup["correct"] = `<p id="foo-123"></p>`;
markup["relaxed"] = `<p id="123"></p>
<p id="#foo[bar]"></p>`;

describe("docs/rules/valid-id.md", () => {
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"valid-id":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"valid-id":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: relaxed", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"valid-id":["error",{"relaxed":true}]}});
		const report = htmlvalidate.validateString(markup["relaxed"]);
		expect(report.results).toMatchSnapshot();
	});
});
