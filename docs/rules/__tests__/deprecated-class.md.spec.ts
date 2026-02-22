import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<button class="old-btn">Click me</button>
<div class="legacy-grid">Content</div>`;
markup["correct"] = `<button class="new-btn">Click me</button>
<div class="modern-layout">Content</div>`;

describe("docs/rules/deprecated-class.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"deprecated-class":["error",{"classes":[{"class":"old-btn"},{"class":"legacy-grid"}]}]}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"deprecated-class":["error",{"classes":[{"class":"old-btn"}]}]}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
