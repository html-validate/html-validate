/**
 * Conformance tests for "ARIA in HTML" specification
 * https://www.w3.org/TR/html-aria
 */

import { Source } from "../../context";
import { HtmlElement } from "../../dom";
import { HtmlValidate } from "../../htmlvalidate";
import htmlAria from "./html-aria";

const htmlvalidate = new HtmlValidate({
	root: true,
	extends: ["html-validate:recommended"],
	elements: ["html5"],
});

async function getElement(markup: string, selector: string): Promise<HtmlElement | null> {
	const source: Source = {
		data: markup,
		filename: "inline",
		line: 1,
		column: 1,
		offset: 0,
	};
	const parser = await htmlvalidate.getParserFor(source);
	const doc = parser.parseHtml(source.data);
	return doc.querySelector(selector);
}

async function implicitRole(markup: string, selector: string): Promise<string | null> {
	const element = await getElement(markup, selector);
	if (!element) {
		return null;
	}
	const meta = element.meta!;
	return meta.implicitRole(element._adapter);
}

describe("§4 ARIA Semantics", () => {
	describe("implicit role", () => {
		it.each(htmlAria)("$description", async ({ markup, selector, role: expectedRole }) => {
			expect.assertions(1);
			const role = await implicitRole(markup, selector);
			expect(role).toBe(expectedRole);
		});
	});
});
