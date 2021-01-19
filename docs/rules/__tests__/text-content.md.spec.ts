import HtmlValidate from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<button type="button"></button>`;
markup["correct"] = `<!-- regular static text -->
<button type="button">Add item</button>

<!-- text from aria-label -->
<button type="button" aria-label="Add item">
  <i class="fa fa-plus" aria-hidden="true"></i>
</button>`;

describe("docs/rules/text-content.md", () => {
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"text-content":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"text-content":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
