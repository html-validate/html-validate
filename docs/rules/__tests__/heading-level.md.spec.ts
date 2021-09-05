import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<h1>Heading 1</h1>
<h3>Subheading</h3>`;
markup["correct"] = `<h1>Heading 1</h1>
<h2>Subheading</h2>`;
markup["min-initial-rank"] = `<nav>
    <h2>Navigation</h2>
</nav>
<h1>Heading 1</h1>`;
markup["sectioning-root"] = `<h1>Heading 1</h1>
<h2>Subheading 2</h2>
<dialog>
    <!-- new sectioning root, heading level can restart at h1 -->
    <h1>Dialog header</h1>
</dialog>
<!-- after dialog the level is restored -->
<h3>Subheading 3</h2>`;

describe("docs/rules/heading-level.md", () => {
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"heading-level":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"heading-level":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: min-initial-rank", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"heading-level":["error",{"minInitialRank":"h2"}]}});
		const report = htmlvalidate.validateString(markup["min-initial-rank"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: sectioning-root", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"heading-level":"error"}});
		const report = htmlvalidate.validateString(markup["sectioning-root"]);
		expect(report.results).toMatchSnapshot();
	});
});
