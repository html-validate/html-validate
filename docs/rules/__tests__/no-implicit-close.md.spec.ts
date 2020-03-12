import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["parent"] = `<ul>
    <li>foo
    <li>bar
    <li>baz
</ul>`;
markup["siblings"] = `<p>lorem ipsum
<p>dolor sit amet`;
markup["adjacent"] = `<p>
    <div>lorem ipsum</div>
</p>`;
markup["correct-list"] = `<ul>
     <li>foo</li>
     <li>bar</li>
     <li>baz</li>
</ul>`;
markup["correct-paragraph"] = `<p>lorem ipsum</p>
<p>dolor sit amet</p>`;

describe("docs/rules/no-implicit-close.md", () => {
	it("inline validation: parent", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-implicit-close":"error"}});
		const report = htmlvalidate.validateString(markup["parent"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: siblings", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-implicit-close":"error"}});
		const report = htmlvalidate.validateString(markup["siblings"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: adjacent", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-implicit-close":"error"}});
		const report = htmlvalidate.validateString(markup["adjacent"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-list", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-implicit-close":"error"}});
		const report = htmlvalidate.validateString(markup["correct-list"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-paragraph", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-implicit-close":"error"}});
		const report = htmlvalidate.validateString(markup["correct-paragraph"]);
		expect(report.results).toMatchSnapshot();
	});
});
