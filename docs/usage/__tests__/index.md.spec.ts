import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["directive-commend"] = `<!-- html-validate-disable-next deprecated -- justification for disabling -->
<blink>Blinking text</blink>
<!-- html-validate-disable-next deprecated: justification for disabling -->
<blink>Blinking text</blink>`;
markup["disable-block-button-type"] = `<div>
  <button type="foo">Invalid button</button>
  <!-- html-validate-disable-block attribute-allowed-values -- will be disabled until the parent div is closed -->
  <button type="bar">Invalid but ignored</button>
  <button type="baz">Still ignored</button>
</div>
<button type="spam">Another invalid</button>`;
markup["disable-next-deprecated"] = `<!-- html-validate-disable-next deprecated -- the next occurrence will not trigger an error -->
<blink>This will not trigger an error</blink>
<blink>But this line will</blink>`;

describe("docs/usage/index.md", () => {
	it("inline validation: directive-commend", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"extends":["html-validate:recommended"]});
		const report = await htmlvalidate.validateString(markup["directive-commend"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: disable-block-button-type", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"extends":["html-validate:recommended"]});
		const report = await htmlvalidate.validateString(markup["disable-block-button-type"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: disable-next-deprecated", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"extends":["html-validate:recommended"]});
		const report = await htmlvalidate.validateString(markup["disable-next-deprecated"]);
		expect(report.results).toMatchSnapshot();
	});
});
