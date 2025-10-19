import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule element-permitted-order", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "element-permitted-order": "error" },
		});
	});

	it("should report error when child is used in wrong order", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<table>
				<thead></thead>
				<caption></caption>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
		"error: Element <caption> must be used before <thead> in this context (element-permitted-order) at inline:4:6:
		  2 | 			<table>
		  3 | 				<thead></thead>
		> 4 | 				<caption></caption>
		    | 				 ^^^^^^^
		  5 | 			</table>
		  6 |
		Selector: table > caption"
	`);
	});

	it("should not report error when child is used in right order", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<caption></caption>
				<thead></thead>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when disallowed child is used", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<foo></foo>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when child with unspecified order is used", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<caption></caption>
				<template></template>
				<thead></thead>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("element-permitted-order");
		expect(docs).toMatchSnapshot();
	});
});
