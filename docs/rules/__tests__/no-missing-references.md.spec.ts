import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<label for="missing-input"></label>
<div aria-labelledby="missing-text"></div>
<div aria-describedby="missing-text another-missing"></div>`;
markup["correct"] = `<label for="my-input"></label>
<div id="verbose-text"></div>
<div id="another-text"></div>
<div aria-labelledby="verbose-text"></div>
<div aria-describedby="verbose-text another-text"></div>
<input id="my-input">`;

describe("docs/rules/no-missing-references.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-missing-references":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-missing-references":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
