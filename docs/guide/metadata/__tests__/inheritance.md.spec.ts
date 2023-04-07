import { HtmlValidate } from "../../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["inheritance"] = `<my-component>
  <span>lorem ipsum</span>
</my-component>
<my-component>
  <div>lorem ipsum</div>
</my-component>`;

describe("docs/guide/metadata/inheritance.md", () => {
	it("inline validation: inheritance", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"my-component":{"inherit":"label"}}],"extends":["html-validate:recommended"]});
		const report = htmlvalidate.validateString(markup["inheritance"]);
		expect(report.results).toMatchSnapshot();
	});
});
