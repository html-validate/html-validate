import { HtmlValidate } from "../../../../src/htmlvalidate";

const markup: { [key: string]: string } = {};
markup["enum"] = `<my-component duck="dewey">...</my-component>
<my-component duck="flintheart">...</my-component>`;
markup["regexp"] = `<my-component ducks="3">...</my-component>
<my-component ducks="huey">...</my-component>`;
markup["boolean"] = `<my-component quacks>...</my-component>
<my-component quacks="duck">...</my-component>`;
markup["omit"] = `<my-component quacks>...</my-component>
<my-component quacks="duck">...</my-component>`;
markup["required"] = `<my-component duck="dewey">...</my-component>
<my-component>...</my-component>`;
markup["deprecated"] = `<my-component duck="dewey">...</my-component>
<my-component>...</my-component>`;

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
