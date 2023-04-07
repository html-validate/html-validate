import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
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
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"element-permitted-content":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"element-permitted-content":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
