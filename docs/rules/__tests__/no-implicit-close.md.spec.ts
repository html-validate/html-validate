import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
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
	it("inline validation: parent", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-implicit-close":"error"}});
		const report = await htmlvalidate.validateString(markup["parent"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: siblings", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-implicit-close":"error"}});
		const report = await htmlvalidate.validateString(markup["siblings"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: adjacent", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-implicit-close":"error"}});
		const report = await htmlvalidate.validateString(markup["adjacent"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-list", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-implicit-close":"error"}});
		const report = await htmlvalidate.validateString(markup["correct-list"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct-paragraph", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-implicit-close":"error"}});
		const report = await htmlvalidate.validateString(markup["correct-paragraph"]);
		expect(report.results).toMatchSnapshot();
	});
});
