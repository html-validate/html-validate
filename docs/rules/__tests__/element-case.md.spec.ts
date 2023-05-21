import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<DIV>...</DIV>`;
markup["correct"] = `<div>...</div>`;
markup["matching"] = `<FooBar>...</Foobar>`;
markup["multiple"] = `<foo-bar></foo-bar>
<FooBar></FooBar>
<fooBar></fooBar>`;

describe("docs/rules/element-case.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"element-case":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"element-case":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: matching", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"element-case":["error",{"style":"pascalcase"}]}});
		const report = await htmlvalidate.validateString(markup["matching"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: multiple", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"element-case":["error",{"style":["lowercase","pascalcase"]}]}});
		const report = await htmlvalidate.validateString(markup["multiple"]);
		expect(report.results).toMatchSnapshot();
	});
});
