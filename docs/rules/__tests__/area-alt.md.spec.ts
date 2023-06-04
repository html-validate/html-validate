import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<img src="image.png" usemap="#imagemap" alt="An awesome image">
<map name="imagemap">
	<area href="target1.html">
	<area alt="Link purpose">
</map>`;
markup["correct"] = `<img src="image.png" usemap="#imagemap" alt="An awesome image">
<map name="imagemap">
	<area href="target1.html" alt="Link purpose">
	<area href="target2.html" alt="Link purpose">
</map>`;
markup["enabled-a11y"] = `<img src="image.png" usemap="#imagemap" alt="An awesome image">
<map name="imagemap">
	<area href="target.html" alt="">
	<area href="target.html" alt="Link purpose">
</map>`;
markup["disabled-a11y"] = `<img src="image.png" usemap="#imagemap" alt="An awesome image">
<map name="imagemap">
	<area href="target.html" alt="">
	<area href="target.html" alt="Link purpose">
</map>`;

describe("docs/rules/area-alt.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"area-alt":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"area-alt":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: enabled-a11y", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"area-alt":["error",{"accessible":true}]}});
		const report = await htmlvalidate.validateString(markup["enabled-a11y"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: disabled-a11y", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"area-alt":["error",{"accessible":false}]}});
		const report = await htmlvalidate.validateString(markup["disabled-a11y"]);
		expect(report.results).toMatchSnapshot();
	});
});
