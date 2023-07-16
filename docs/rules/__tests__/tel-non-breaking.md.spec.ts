import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<a href="tel:555123456">
    <span>555-123 456</span>
</a>`;
markup["correct"] = `<a href="tel:555123456">
    <span>555&#8209;123&nbsp;456</span>
</a>`;
markup["ignored"] = `<a class="nobreak" href="tel:555123456">
    <span>555-123 456</span>
</a>`;
markup["ignore-style"] = `<a style="white-space: nowrap" href="tel:555123456">
    555-123 456
</a>`;

describe("docs/rules/tel-non-breaking.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"tel-non-breaking":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"tel-non-breaking":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: ignored", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"tel-non-breaking":["error",{"ignoreClasses":["nobreak"]}]}});
		const report = await htmlvalidate.validateString(markup["ignored"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: ignore-style", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"tel-non-breaking":"error"}});
		const report = await htmlvalidate.validateString(markup["ignore-style"]);
		expect(report.results).toMatchSnapshot();
	});
});
