import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<!-- <li> is only allowed with <ul> or <ol> as parent -->
<div>
    <li>foo</li>
</div>

<!-- interactive elements cannot be nested -->
<button>
    <a href="#">Lorem ipsum</a>
</button>`;
markup["correct"] = `<ul>
    <li>foo</li>
</ul>

<button>
    Lorem ipsum
</button>`;

describe("docs/rules/element-permitted-content.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"element-permitted-content":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"element-permitted-content":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
