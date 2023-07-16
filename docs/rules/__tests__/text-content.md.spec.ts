import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<button type="button"></button>`;
markup["correct"] = `<!-- regular static text -->
<button type="button">Add item</button>

<!-- text from aria-label -->
<button type="button" aria-label="Add item">
  <i class="fa-solid fa-plus" aria-hidden="true"></i>
</button>`;

describe("docs/rules/text-content.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"text-content":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"text-content":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
