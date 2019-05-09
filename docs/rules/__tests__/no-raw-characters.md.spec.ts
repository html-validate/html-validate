import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<p>Fred & Barney</p>
<p class=foo's></p>`;
markup["correct"] = `<p>Fred &amp; Barney</p>
<p class=foo&apos;s></p>
<p class="'foo'"></p>`;
markup["malformed"] = `<p>Fred <3 Barney</p>`;
markup["relaxed"] = `<!-- Not ambiguous: & is followed by whitespace -->
<p>Fred & Barney</p>

<!-- Not ambiguous: &Barney is not terminated by ; -->
<p>Fred&Barney</p>

<!-- Not ambiguous: = and " both stops the character reference -->
<a href="?foo&bar=1&baz"></p>

<!-- Not ambiguous: even unquoted & is understod to be stopped by > -->
<a href=?foo&bar></p>`;

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
	it("inline validation: relaxed", () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-raw-characters":["error",{"relaxed":true}]}});
		const report = htmlvalidate.validateString(markup["relaxed"]);
		expect(report.results).toMatchSnapshot();
	});
});
