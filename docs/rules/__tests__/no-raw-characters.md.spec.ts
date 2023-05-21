import { HtmlValidate } from "../../../src/htmlvalidate";

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

<!-- Not ambiguous: even unquoted & is understood to be stopped by > -->
<a href=?foo&bar></p>`;

describe("docs/rules/no-raw-characters.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-raw-characters":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-raw-characters":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: malformed", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-raw-characters":"error"}});
		const report = await htmlvalidate.validateString(markup["malformed"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: relaxed", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-raw-characters":["error",{"relaxed":true}]}});
		const report = await htmlvalidate.validateString(markup["relaxed"]);
		expect(report.results).toMatchSnapshot();
	});
});
