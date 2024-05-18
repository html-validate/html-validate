import { HtmlValidate } from "../../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<a href><img src="cat.gif"></a>`;
markup["correct"] = `<a href>lorem ipsum</a>
<a href><img src="cat.gif" alt="cat page"></a>
<a href aria-label="lorem ipsum"></a>
<a href aria-hidden="true"></a>`;

describe("docs/rules/wcag/h30.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h30":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h30":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
