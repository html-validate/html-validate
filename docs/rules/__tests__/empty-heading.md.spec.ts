import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<h1></h1>
<h2><span></span></h2>`;
markup["correct"] = `<h1>Lorem ipsum</h1>
<h2><span>Dolor sit amet</span></h2>`;
markup["whitespace"] = `<h1> </h1>`;
markup["img-alt"] = `<h1>
    <img src="awesome-logo.png" alt="Our awesome logo!">
</h1>`;
markup["hidden-invalid"] = `<h1 hidden></h1>
<div hidden>
    <h2></h1>
</div>`;
markup["hidden-valid"] = `<h1 hidden>Lorem ipsum</h1>
<div hidden>
    <h2>dolor sit amet</h2>
</div>`;

describe("docs/rules/empty-heading.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"empty-heading":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"empty-heading":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: whitespace", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"empty-heading":"error"}});
		const report = await htmlvalidate.validateString(markup["whitespace"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: img-alt", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"empty-heading":"error"}});
		const report = await htmlvalidate.validateString(markup["img-alt"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: hidden-invalid", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"empty-heading":"error"}});
		const report = await htmlvalidate.validateString(markup["hidden-invalid"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: hidden-valid", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"empty-heading":"error"}});
		const report = await htmlvalidate.validateString(markup["hidden-valid"]);
		expect(report.results).toMatchSnapshot();
	});
});
