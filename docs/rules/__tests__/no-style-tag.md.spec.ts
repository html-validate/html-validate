import { HtmlValidate } from "../../../src/htmlvalidate";

const markup: Record<string, string> = {};
markup["incorrect"] = `<style>
    body {
        background-color: hotpink;
    }
</style>`;
markup["correct"] = `<link rel="stylesheet" src="my-style.css">`;
markup["allow-template"] = `<template>
    <style>
        :host {
            display: block;
        }
    </style>
</template>`;

describe("docs/rules/no-style-tag.md", () => {
	it("inline validation: incorrect", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-style-tag":"error"}});
		const report = await htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: correct", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-style-tag":"error"}});
		const report = await htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it("inline validation: allow-template", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({"rules":{"no-style-tag":["error",{"allowTemplate":true}]}});
		const report = await htmlvalidate.validateString(markup["allow-template"]);
		expect(report.results).toMatchSnapshot();
	});
});
