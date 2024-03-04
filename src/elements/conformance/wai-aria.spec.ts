/**
 * Conformance tests for WAI-ARIA specification
 * https://www.w3.org/TR/wai-aria
 */

import path from "node:path";
import { globSync } from "glob";
import "../../jest";
import { ariaNaming } from "../../rules/helper";
import { Source } from "../../context";
import { HtmlElement } from "../../dom";
import { HtmlValidate } from "../../htmlvalidate";
import waiAria from "./wai-aria";

const htmlvalidate = new HtmlValidate({
	root: true,
	extends: ["html-validate:recommended"],
	elements: ["html5"],
});

async function getElement(role: string): Promise<HtmlElement | null> {
	const source: Source = {
		data: `<div role="${role}"></role>`,
		filename: "inline",
		line: 1,
		column: 1,
		offset: 0,
	};
	const parser = await htmlvalidate.getParserFor(source);
	const doc = parser.parseHtml(source.data);
	return doc.querySelector("div");
}

async function naming(role: string): Promise<string | null> {
	const element = await getElement(role);
	if (!element) {
		return null;
	}
	return ariaNaming(element);
}

describe("§5 The Roles Model", () => {
	describe("§5.2.8.5 Roles Supporting Name from Content", () => {
		it.each(waiAria)("$role", async ({ role, naming: expectedNaming }) => {
			expect.assertions(1);
			const result = await naming(role);
			expect(result).toBe(expectedNaming);
		});
	});
});

describe("validator test-files", () => {
	const mapping = {
		"abstract-roles-prohibited.html": {
			"no-abstract-role": "error",
		},
	} as const;

	const fixtureDir = "test-files/wai-aria";
	const files = globSync("*.html", { cwd: fixtureDir }) as Array<keyof typeof mapping>;

	it.each(files)("%s", async (filename) => {
		expect.assertions(1);
		const filePath = path.join(fixtureDir, filename);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: mapping[filename],
		});
		const report = await htmlvalidate.validateFile(filePath);
		expect(report).toMatchCodeframe();
	});
});
