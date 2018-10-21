import HtmlValidate from '../../src/htmlvalidate';

const markup: {[key: string]: string} = {};
markup["frontpage-contentmodel"] = `<footer>
  <fieldset>
    <p>Lorem ipsum dolor sit amet</p>
    <legend>Consectetur adipiscing elit</legend>
  </fieldset>

  <main>
    <blink>(c) 2018 Initech</blink>
  </main>
</footer>`;
markup["frontpage-a17y"] = `<img src="logo.png">
<button onclick="myFunction();">Click me!</button>

<div class="field-wrapper">
  <strong>Name: </strong>
  <input name="name">
</div>`;
markup["frontpage-components"] = `<my-inline>
  <my-block></my-block>
  <my-deprecated></my-deprecated>
</my-inline>`;

describe('docs/index.md', () => {
	it('inline validation: frontpage-contentmodel', () => {
		const htmlvalidate = new HtmlValidate({"extends":["htmlvalidate:recommended"]});
		const report = htmlvalidate.validateString(markup["frontpage-contentmodel"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: frontpage-a17y', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"img-req-alt":"error","button-type":"error","input-missing-label":"error"}});
		const report = htmlvalidate.validateString(markup["frontpage-a17y"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: frontpage-components', () => {
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"my-inline":{"phrasing":true,"permittedContent":["@phrasing"]},"my-block":{"flow":true},"my-deprecated":{"phrasing":true,"deprecated":"replaced with <my-other>"}}],"extends":["htmlvalidate:recommended"]});
		const report = htmlvalidate.validateString(markup["frontpage-components"]);
		expect(report.results).toMatchSnapshot();
	});
});
