import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<a target="_blank">
<button type="button" formaction="post">
<meta name=".." http-equiv="..">`;
markup["correct"] = `<a href=".." target="_blank">
<button type="submit" formaction="post">
<meta name=".." content="..">
<meta http-equiv=".." content="..">`;

describe("docs/rules/attribute-misuse.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"attribute-misuse":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"attribute-misuse":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
