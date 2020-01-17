import HtmlValidate from "../../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["tags"] = `<my-component>
  <button type="button">click me!</button>
</my-component>`;
markup["exclude"] = `<my-component>
  <div>allowed</div>
  <span>also allowed</span>
  <h1>not allowed</h1>
</my-component>`;
markup["descendants"] = `<my-component>
<!-- the div itself is allowed -->
  <div>
    <footer>
      sectioning element can no longer be used
    </footer>
    <my-component>
      nor can the component be nested
    </my-component>
  </div>
  <span>also allowed</span>
  <h1>not allowed</h1>
</my-component>`;

describe("docs/guide/metadata/restrict-content.md", () => {
	it("inline validation: tags", () => {
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"my-component":{"flow":true,"permittedContent":["span","strong","em"]}}],"extends":["html-validate:recommended"]});
		const report = htmlvalidate.validateString(markup["tags"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: exclude", () => {
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"my-component":{"flow":true,"permittedContent":[{"exclude":"@heading"}]}}],"extends":["html-validate:recommended"]});
		const report = htmlvalidate.validateString(markup["exclude"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: descendants", () => {
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"footer":{"flow":true,"sectioning":true},"my-component":{"flow":true,"permittedDescendants":[{"exclude":["@sectioning","my-component"]}]}}],"extends":["html-validate:recommended"]});
		const report = htmlvalidate.validateString(markup["descendants"]);
		expect(report.results).toMatchSnapshot();
	});
});
