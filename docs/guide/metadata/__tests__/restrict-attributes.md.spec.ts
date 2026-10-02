import { describe, expect, it } from "@jest/globals";
import { HtmlValidate } from "../../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["enum"] = `<!-- ok: attribute value is explicitly allowed -->
<my-component duck="dewey"></my-component>

<!-- error: attribute value is not one of the allowed values -->
<my-component duck="flintheart"></my-component>`;
markup["regexp"] = `<!-- ok: any numerical value is allowed -->
<my-component ducks="3"></my-component>

<!-- error: non-numerical values are disallowed -->
<my-component ducks="huey"></my-component>`;
markup["boolean"] = `<!-- ok: boolean attribute -->
<my-component quacks></my-component>

<!-- error: boolean attribute cannot take value -->
<my-component quacks="duck"></my-component>`;
markup["omit"] = `<!-- ok: omitting value is allowed -->
<my-component quacks></my-component>

<!-- ok: value is one of the allowed values -->
<my-component quacks="duck"></my-component>`;
markup["required"] = `<!-- ok: attribute is present -->
<my-component duck="dewey"></my-component>

<!-- error: attribute is omitted -->
<my-component></my-component>`;
markup["deprecated"] = `<!-- error: uses deprecated attribute -->
<my-component duck="dewey"></my-component>

<!-- ok: omitted deprecated attribute -->
<my-component></my-component>`;

describe("docs/guide/metadata/restrict-attributes.md", () => {
	it("inline validation: enum", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"my-component":{"flow":true,"attributes":{"duck":{"enum":["huey","dewey","louie"]}}}}],"extends":["html-validate:recommended"]});
		const report = await htmlvalidate.validateString(markup["enum"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: regexp", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"my-component":{"flow":true,"attributes":{"ducks":{"enum":["/\\d+/"]}}}}],"extends":["html-validate:recommended"]});
		const report = await htmlvalidate.validateString(markup["regexp"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: boolean", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"my-component":{"flow":true,"attributes":{"quacks":{"boolean":true}}}}],"extends":["html-validate:recommended"]});
		const report = await htmlvalidate.validateString(markup["boolean"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: omit", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"my-component":{"flow":true,"attributes":{"quacks":{"omit":true,"enum":["duck","dog"]}}}}],"extends":["html-validate:recommended"]});
		const report = await htmlvalidate.validateString(markup["omit"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: required", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"my-component":{"flow":true,"attributes":{"duck":{"required":true}}}}],"extends":["html-validate:recommended"]});
		const report = await htmlvalidate.validateString(markup["required"]);
		expect(report.results).toMatchSnapshot();
	});

	it("inline validation: deprecated", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"my-component":{"flow":true,"attributes":{"duck":{"deprecated":true}}}}],"extends":["html-validate:recommended"]});
		const report = await htmlvalidate.validateString(markup["deprecated"]);
		expect(report.results).toMatchSnapshot();
	});
});
