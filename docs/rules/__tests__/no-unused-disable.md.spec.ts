import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<!-- [html-validate-disable-next attribute-allowed-values -- no error, disable is invalid] -->
<button type="submit"></button>`;
markup["correct-removed"] = `<!-- disable removed, no error -->
<button type="submit"></button>`;
markup["correct-error-present"] = `<!-- [html-validate-disable-next attribute-allowed-values -- element has error, disable is valid] -->
<button type="foobar"></button>`;
markup["correct-disabled"] = `<!-- [html-validate-disable-next attribute-allowed-values, no-unused-disable -- no error as no-unused-disable is also disabled] -->
<button type="submit"></button>`;

describe("docs/rules/no-unused-disable.md", () => {
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-unused-disable":"error","attribute-allowed-values":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-removed", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-unused-disable":"error","attribute-allowed-values":"error"}});
		const report = htmlvalidate.validateString(markup["correct-removed"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-error-present", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-unused-disable":"error","attribute-allowed-values":"error"}});
		const report = htmlvalidate.validateString(markup["correct-error-present"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-disabled", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-unused-disable":"error","attribute-allowed-values":"error"}});
		const report = htmlvalidate.validateString(markup["correct-disabled"]);
		expect(report.results).toMatchSnapshot();
	});
});
