/**
 * Conformance tests for WAI-ARIA specification
 * https://www.w3.org/TR/wai-aria
 */

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
