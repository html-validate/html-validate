import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<p>Fred & Barney</p>
<p class=foo's></p>`;
markup["correct"] = `<p>Fred &amp; Barney</p>
<p class=foo&apos;s></p>`;
markup["malformed"] = `<p>Fred <3 Barney</p>`;

describe("docs/rules/no-raw-characters.md", () => {
	it("inline validation: incorrect", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-raw-characters":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-raw-characters":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: malformed", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-raw-characters":"error"}});
		const report = htmlvalidate.validateString(markup["malformed"]);
		expect(report.results).toMatchSnapshot();
	});
});
