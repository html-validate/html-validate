/**
 * Conformance tests for "ARIA in HTML" specification
 * https://www.w3.org/TR/html-aria
 */

import { type Source } from "../../context";
import { type HtmlElement } from "../../dom";
import { HtmlValidate } from "../../htmlvalidate";
import { type Parser } from "../../parser";
import { ariaNaming } from "../../rules/helper";
import htmlAria from "./html-aria";

const htmlvalidate = new HtmlValidate({
	root: true,
	extends: ["html-validate:recommended"],
	elements: ["html5"],
});

const source: Source = {
	data: "",
	filename: "inline",
	line: 1,
	column: 1,
	offset: 0,
};

let parser: Parser;

beforeAll(async () => {
	parser = await htmlvalidate.getParserFor(source);
});

function getElement(markup: string, selector: string): HtmlElement | null {
	const doc = parser.parseHtml(markup);
	return doc.querySelector(selector);
}

function implicitRole(markup: string, selector: string): string | null {
	const element = getElement(markup, selector);
	if (!element) {
		return null;
	}
	const { aria } = element.meta!;
	return aria.implicitRole(element._adapter);
}

function naming(markup: string, selector: string): string | null {
	const element = getElement(markup, selector);
	if (!element) {
		return null;
	}
	return ariaNaming(element);
}

describe("§4 ARIA Semantics", () => {
	describe("implicit role", () => {
		it.each(htmlAria)("$description", ({ markup, selector, role: expectedRole }) => {
			expect.assertions(1);
			const role = implicitRole(markup, selector);
			expect(role).toBe(expectedRole);
		});
	});

	describe("naming", () => {
		it.each(htmlAria)("$description", ({ markup, selector, naming: expectedNaming }) => {
			expect.assertions(1);
			const result = naming(markup, selector);
			expect(result).toBe(expectedNaming);
		});
	});
});
