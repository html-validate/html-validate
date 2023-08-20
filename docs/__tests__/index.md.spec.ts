import { HtmlValidate } from "../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["frontpage-contentmodel"] = `<footer>
  <fieldset>
    <p>Lorem ipsum dolor sit amet</p>
    <legend>Consectetur adipiscing elit</legend>
  </fieldset>

  <main>
    <blink>(c) 2018 Initech</blink>
  </main>

</footer>`;
markup["frontpage-a11y"] = `<img src="logo.png">
<button onclick="myFunction();">Click me!</button>

<div class="field-wrapper">
  <strong>Name: </strong>
  <input type="text" name="name">
</div>`;
markup["frontpage-components"] = `<my-inline>
  <my-block></my-block>
  <my-deprecated></my-deprecated>
</my-inline>`;

describe("docs/index.md", () => {
	it("inline validation: frontpage-contentmodel", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"extends":["html-validate:recommended"]});
		const report = await htmlvalidate.validateString(markup["frontpage-contentmodel"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: frontpage-a11y", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"wcag/h37":"error","no-implicit-button-type":"error","input-missing-label":"error"}});
		const report = await htmlvalidate.validateString(markup["frontpage-a11y"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: frontpage-components", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"my-inline":{"phrasing":true,"permittedContent":["@phrasing"]},"my-block":{"flow":true},"my-deprecated":{"phrasing":true,"deprecated":"replaced with <my-other>"}}],"extends":["html-validate:recommended"]});
		const report = await htmlvalidate.validateString(markup["frontpage-components"]);
		expect(report.results).toMatchSnapshot();
	});
});
