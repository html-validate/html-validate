import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">`;
markup["legacy"] = `<!DOCTYPE html SYSTEM "about:legacy-compat">`;
markup["correct"] = `<!DOCTYPE html>`;

describe("docs/rules/doctype-html.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"doctype-html":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: legacy", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"doctype-html":"error"}});
		const report = await htmlvalidate.validateString(markup["legacy"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"doctype-html":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
