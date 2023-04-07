import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<form>
    <input name="foo">
    <input name="foo">
</form>`;
markup["correct"] = `<form>
    <input name="foo">
    <input name="bar">
</form>`;
markup["correct-radio-checkbox"] = `<form>
    <input name="foo" type="radio">
    <input name="foo" type="radio">
</form>`;
markup["incorrect-radio"] = `<form>
    <input name="foo" type="text">
    <input name="foo" type="radio">
</form>`;
markup["array-incorrect"] = `<form>
    <input name="foo[]">
    <input name="foo[]">
</form>`;
markup["array-correct"] = `<form>
    <input name="foo[]">
    <input name="foo[]">
</form>`;
markup["shared-incorrect"] = `<form>
    <input name="foo" type="checkbox">
    <input name="foo" type="checkbox">
</form>`;
markup["shared-correct"] = `<form>
    <input name="foo" type="checkbox">
    <input name="foo" type="checkbox">
</form>`;
markup["shared-mix"] = `<form>
    <input name="foo" type="checkbox">
    <input name="foo" type="radio">
</form>`;

describe("docs/rules/form-dup-name.md", () => {
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-radio-checkbox", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":"error"}});
		const report = htmlvalidate.validateString(markup["correct-radio-checkbox"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: incorrect-radio", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect-radio"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: array-incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":["error",{"allowArrayBrackets":false}]}});
		const report = htmlvalidate.validateString(markup["array-incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: array-correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":"error"}});
		const report = htmlvalidate.validateString(markup["array-correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: shared-incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":["error",{"shared":["radio"]}]}});
		const report = htmlvalidate.validateString(markup["shared-incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: shared-correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":["error",{"shared":["radio","checkbox"]}]}});
		const report = htmlvalidate.validateString(markup["shared-correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: shared-mix", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":["error",{"shared":["radio","checkbox"]}]}});
		const report = htmlvalidate.validateString(markup["shared-mix"]);
		expect(report.results).toMatchSnapshot();
	});
});
