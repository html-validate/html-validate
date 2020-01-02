import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<DIV>...</DIV>`;
markup["correct"] = `<div>...</div>`;
markup["multiple"] = `<foo-bar></foo-bar>
<FooBar></FooBar>
<fooBar></fooBar>`;

describe("docs/rules/element-case.md", () => {
	it("inline validation: incorrect", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"element-case":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"element-case":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: multiple", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"element-case":["error",{"style":["lowercase","pascalcase"]}]}});
		const report = htmlvalidate.validateString(markup["multiple"]);
		expect(report.results).toMatchSnapshot();
	});
});
