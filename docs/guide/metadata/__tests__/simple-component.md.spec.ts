import HtmlValidate from "../../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["no-metadata-1"] = `<!-- this is probably legal? -->
<div>
  <my-component>lorem ipsum</my-component>
</div>

<!-- but should it work inside a span? -->
<span>
  <my-component>lorem ipsum</my-component>
</span>`;
markup["no-metadata-2"] = `<!-- can it contain an interactive button? who knows? -->
<my-component>
  <button type="button">click me!</button>
</my-component>

<!-- or is it allowed inside a button? -->
<button type="button">
  <my-component>click me!</my-component>
</button>`;
markup["no-metadata-3"] = `<!-- lets nest the component for fun and profit! -->
<my-component>
  <my-component>
    <my-component>
      Sup dawg I heard you like components so I put components inside your components.
    </my-component>
  </my-component>
</my-component>`;
markup["basic-metadata"] = `<div>
  <my-component>lorem ipsum</my-component>
</div>`;
markup["flow-metadata-1"] = `<div>
  <my-component>lorem ipsum</my-component>
</div>`;
markup["flow--metadata-2"] = `<span>
  <my-component>lorem ipsum</my-component>
</span>`;
markup["phrasing-metadata"] = `<span>
  <my-component>lorem ipsum</my-component>
</span>`;

describe("docs/guide/metadata/simple-component.md", () => {
	it("inline validation: no-metadata-1", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"extends":["html-validate:recommended"]});
		const report = htmlvalidate.validateString(markup["no-metadata-1"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: no-metadata-2", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"extends":["html-validate:recommended"]});
		const report = htmlvalidate.validateString(markup["no-metadata-2"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: no-metadata-3", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"extends":["html-validate:recommended"]});
		const report = htmlvalidate.validateString(markup["no-metadata-3"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: basic-metadata", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"my-component":{}}],"extends":["html-validate:recommended"]});
		const report = htmlvalidate.validateString(markup["basic-metadata"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: flow-metadata-1", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"my-component":{"flow":true}}],"extends":["html-validate:recommended"]});
		const report = htmlvalidate.validateString(markup["flow-metadata-1"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: flow--metadata-2", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"my-component":{"flow":true}}],"extends":["html-validate:recommended"]});
		const report = htmlvalidate.validateString(markup["flow--metadata-2"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: phrasing-metadata", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"my-component":{"flow":true,"phrasing":true}}],"extends":["html-validate:recommended"]});
		const report = htmlvalidate.validateString(markup["phrasing-metadata"]);
		expect(report.results).toMatchSnapshot();
	});
});
