import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
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
markup["checkbox-incorrect"] = `<form>
    <input name="foo" value="0" type="hidden">
    <input name="foo" value="1" type="checkbox">
</form>`;
markup["checkbox-correct"] = `<form>
    <input name="foo" value="0" type="hidden">
    <input name="foo" value="1" type="checkbox">
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
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-radio-checkbox", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":"error"}});
		const report = await htmlvalidate.validateString(markup["correct-radio-checkbox"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: incorrect-radio", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect-radio"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: array-incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":["error",{"allowArrayBrackets":false}]}});
		const report = await htmlvalidate.validateString(markup["array-incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: array-correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":"error"}});
		const report = await htmlvalidate.validateString(markup["array-correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: checkbox-incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":["error",{"allowCheckboxDefault":false}]}});
		const report = await htmlvalidate.validateString(markup["checkbox-incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: checkbox-correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":["error",{"allowCheckboxDefault":true}]}});
		const report = await htmlvalidate.validateString(markup["checkbox-correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: shared-incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":["error",{"shared":["radio"]}]}});
		const report = await htmlvalidate.validateString(markup["shared-incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: shared-correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":["error",{"shared":["radio","checkbox"]}]}});
		const report = await htmlvalidate.validateString(markup["shared-correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: shared-mix", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"form-dup-name":["error",{"shared":["radio","checkbox"]}]}});
		const report = await htmlvalidate.validateString(markup["shared-mix"]);
		expect(report.results).toMatchSnapshot();
	});
});
