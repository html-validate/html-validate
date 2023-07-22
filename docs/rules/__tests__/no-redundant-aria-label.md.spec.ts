import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<label for="foo"> lorem ipsum </label>
<input id="foo" aria-label="lorem ipsum" />`;
markup["correct"] = `<!-- different texts -->
<label for="foo"> lorem ipsum </label>
<input id="foo" aria-label="screenreader text" />

<!-- only label -->
<label for="foo"> lorem ipsum </label>
<input id="foo" />`;

describe("docs/rules/no-redundant-aria-label.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-redundant-aria-label":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-redundant-aria-label":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
