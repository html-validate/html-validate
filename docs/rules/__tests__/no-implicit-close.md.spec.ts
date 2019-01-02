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
		const htmlvalidate = new HtmlValidate({"rules":{"no-implicit-close":"error"}});
		const report = htmlvalidate.validateString(markup["parent"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: siblings", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-implicit-close":"error"}});
		const report = htmlvalidate.validateString(markup["siblings"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: adjacent", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-implicit-close":"error"}});
		const report = htmlvalidate.validateString(markup["adjacent"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-list", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-implicit-close":"error"}});
		const report = htmlvalidate.validateString(markup["correct-list"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-paragraph", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-implicit-close":"error"}});
		const report = htmlvalidate.validateString(markup["correct-paragraph"]);
		expect(report.results).toMatchSnapshot();
	});
});
