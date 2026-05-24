import { describe, expect, it } from "@jest/globals";
import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<p style="color: red"></p>`;
markup["correct"] = `<p class="error"></p>`;
markup["allowed-properties"] = `<p style="display: none"></p>`;
markup["allow-variables"] = `<p style="--my-color: red"></p>`;
markup["disallow-variables"] = `<p style="--my-color: red"></p>`;

describe("docs/rules/no-inline-style.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-inline-style":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-inline-style":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: allowed-properties", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-inline-style":"error"}});
		const report = await htmlvalidate.validateString(markup["allowed-properties"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: allow-variables", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-inline-style":"error"}});
		const report = await htmlvalidate.validateString(markup["allow-variables"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: disallow-variables", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-inline-style":["error",{"allowVariables":false}]}});
		const report = await htmlvalidate.validateString(markup["disallow-variables"]);
		expect(report.results).toMatchSnapshot();
	});
});
