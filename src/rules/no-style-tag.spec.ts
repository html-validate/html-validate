import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-style-tag", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-style-tag": "error" },
		});
	});

	it("should not report for other tags", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when <style> is used", async () => {
		expect.assertions(2);
		const html = "<style>foo</style>";
		const report = await htmlvalidate.validateString(html);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Use external stylesheet with <link> instead of <style> tag (no-style-tag) at inline:1:1:
			> 1 | <style>foo</style>
			    | ^^^^^^
			Selector: style"
		`);
	});

	describe("with allowTemplate enabled", () => {
		it("should not report error when <style> is direct child of <template>", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<template>
					<style></style>
				</template>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when <style> is not direct child of <template>", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<template>
					<div>
						<style></style>
					</div>
				</template>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Use external stylesheet with <link> instead of <style> tag (no-style-tag) at inline:4:7:
				  2 | 				<template>
				  3 | 					<div>
				> 4 | 						<style></style>
				    | 						^^^^^^
				  5 | 					</div>
				  6 | 				</template>
				  7 |
				Selector: template > div > style"
			`);
		});
	});

	describe("with allowTemplate disabled", () => {
		let htmlvalidateNoTemplate: HtmlValidate;

		beforeAll(() => {
			htmlvalidateNoTemplate = new HtmlValidate({
				rules: { "no-style-tag": ["error", { allowTemplate: false }] },
			});
		});

		it("should report error when <style> is direct child of <template>", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<template>
					<style></style>
				</template>
			`;
			const report = await htmlvalidateNoTemplate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: Use external stylesheet with <link> instead of <style> tag (no-style-tag) at inline:3:6:
				  1 |
				  2 | 				<template>
				> 3 | 					<style></style>
				    | 					^^^^^^
				  4 | 				</template>
				  5 |
				Selector: template > style"
			`);
		});
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("no-style-tag");
		expect(docs).toMatchSnapshot();
	});
});
