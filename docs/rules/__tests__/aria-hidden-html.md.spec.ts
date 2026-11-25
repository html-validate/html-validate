import { describe, expect, it } from "@jest/globals";
import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<html aria-hidden="true"></html>`;
markup["correct"] = `<html></html>`;

describe("docs/rules/aria-hidden-html.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"aria-hidden-html":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"aria-hidden-html":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
