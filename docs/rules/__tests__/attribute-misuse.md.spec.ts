import { describe, expect, it } from "@jest/globals";
import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<a target="_blank"></a>
<button type="button" formaction="post"></button>
<meta name=".." http-equiv=".." />`;
markup["correct"] = `<a href=".." target="_blank"></a>
<button type="submit" formaction="post"></button>
<meta name=".." content=".." />
<meta http-equiv=".." content=".." />`;

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
