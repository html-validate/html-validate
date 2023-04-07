import { HtmlValidate } from "../../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<img>
<input type="image">`;
markup["correct"] = `<img alt="...">
<input type="image" alt="..">`;
markup["allow-empty"] = `<span>The task was successfully completed! <img src="thumbsup.png" alt=""></span>`;
markup["alias"] = `<img data-alt="...">`;

describe("docs/rules/wcag/h37.md", () => {
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h37":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h37":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: allow-empty", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h37":["error",{"allowEmpty":true}]}});
		const report = htmlvalidate.validateString(markup["allow-empty"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: alias", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h37":["error",{"alias":["data-alt"]}]}});
		const report = htmlvalidate.validateString(markup["alias"]);
		expect(report.results).toMatchSnapshot();
	});
});
