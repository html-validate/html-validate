import { HtmlValidate } from "../../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["incorrect"] = `<img title="Lorem ipsum">`;
markup["correct"] = `<!-- empty alt text and no title is interpreted as purely decorative -->
<img alt="">

<!-- alt text is used together with title, the image carries meaning and will not be ignored by AT -->
<img alt="Lorem ipsum" title="Lorem ipsum">`;

describe("docs/rules/wcag/h67.md", () => {
	it("inline validation: incorrect", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h67":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h67":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
