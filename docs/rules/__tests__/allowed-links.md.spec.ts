import { describe, expect, it } from "@jest/globals";
import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["external-invalid"] = `<a href="http://example.net/foo"></a>`;
markup["external-valid"] = `<a href="./foo"></a>`;
markup["relative-invalid"] = `<a href="../foo"></a>`;
markup["relative-valid"] = `<a href="/foo"></a>`;
markup["absolute-invalid"] = `<a href="/foo"></a>`;
markup["absolute-valid"] = `<a href="../foo"></a>`;
markup["base-invalid"] = `<a href="foo"></a>`;
markup["base-valid"] = `<a href="./foo"></a>`;
markup["external-include"] = `<!-- allowed -->
<a href="//foo.example.net"></a>

<!-- not allowed -->
<a href="//bar.example.net"></a>`;

describe("docs/rules/allowed-links.md", () => {
	it("inline validation: external-invalid", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"allowed-links":["error",{"allowExternal":false}]}});
		const report = await htmlvalidate.validateString(markup["external-invalid"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: external-valid", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"allowed-links":["error",{"allowExternal":false}]}});
		const report = await htmlvalidate.validateString(markup["external-valid"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: relative-invalid", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"allowed-links":["error",{"allowRelative":false}]}});
		const report = await htmlvalidate.validateString(markup["relative-invalid"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: relative-valid", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"allowed-links":["error",{"allowRelative":false}]}});
		const report = await htmlvalidate.validateString(markup["relative-valid"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: absolute-invalid", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"allowed-links":["error",{"allowAbsolute":false}]}});
		const report = await htmlvalidate.validateString(markup["absolute-invalid"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: absolute-valid", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"allowed-links":["error",{"allowAbsolute":false}]}});
		const report = await htmlvalidate.validateString(markup["absolute-valid"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: base-invalid", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"allowed-links":["error",{"allowBase":false}]}});
		const report = await htmlvalidate.validateString(markup["base-invalid"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: base-valid", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"allowed-links":["error",{"allowBase":false}]}});
		const report = await htmlvalidate.validateString(markup["base-valid"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: external-include", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"allowed-links":["error",{"allowExternal":{"include":["^//foo.example.net"]}}]}});
		const report = await htmlvalidate.validateString(markup["external-include"]);
		expect(report.results).toMatchSnapshot();
	});
});
