import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<DIV>...</DIV>`;
markup["correct"] = `<div>...</div>`;
markup["matching"] = `<FooBar>...</Foobar>`;
markup["multiple"] = `<foo-bar></foo-bar>
<FooBar></FooBar>
<fooBar></fooBar>`;

describe("docs/rules/element-case.md", () => {
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"element-case":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"element-case":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: matching", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"element-case":["error",{"style":"pascalcase"}]}});
		const report = htmlvalidate.validateString(markup["matching"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: multiple", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"element-case":["error",{"style":["lowercase","pascalcase"]}]}});
		const report = htmlvalidate.validateString(markup["multiple"]);
		expect(report.results).toMatchSnapshot();
	});
});
