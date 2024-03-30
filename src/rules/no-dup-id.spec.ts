import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import "../jest";

describe("rule no-dup-id", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-dup-id": "error" },
		});
	});

	it("should not report when no id is duplicated", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<p id="foo"></p>
			<p id="bar"></p>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when id is missing value", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<hr id />
			<hr id />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when id is empty string", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<hr id="" />
			<hr id="" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when id is same as an id within <template>", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<hr id="foo" />
			<template>
				<hr id="foo" />
			</template>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for interpolated attributes", async () => {
		expect.assertions(1);
		const markup = '<p id="{{ interpolated }}"></p><p id="{{ interpolated }}"></p>';
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should not report error for dynamic attributes", async () => {
		expect.assertions(1);
		const markup = '<p dynamic-id="myVariable"></p><p dynamic-id="myVariable"></p>';
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report when id is duplicated", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<p id="foo"></p>
			<p id="foo"></p>
			<template>
				<p id="bar"></p>
				<p id="bar"></p>
			</template>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Duplicate ID "foo" (no-dup-id) at inline:3:11:
			  1 |
			  2 | 			<p id="foo"></p>
			> 3 | 			<p id="foo"></p>
			    | 			       ^^^
			  4 | 			<template>
			  5 | 				<p id="bar"></p>
			  6 | 				<p id="bar"></p>
			Selector: p:nth-child(2)
			error: Duplicate ID "bar" (no-dup-id) at inline:6:12:
			  4 | 			<template>
			  5 | 				<p id="bar"></p>
			> 6 | 				<p id="bar"></p>
			    | 				       ^^^
			  7 | 			</template>
			  8 |
			Selector: template > p:nth-child(2)"
		`);
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/no-dup-id.html");
		expect(report).toMatchInlineCodeframe(`
			"error: Duplicate ID "foo" (no-dup-id) at test-files/rules/no-dup-id.html:3:10:
			  1 | <div id="foo"></div>
			  2 | <div id="bar"></div>
			> 3 | <div id="foo"></div>
			    |          ^^^
			  4 |
			Selector: div:nth-child(3)"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("no-dup-id");
		expect(docs).toMatchSnapshot();
	});
});
