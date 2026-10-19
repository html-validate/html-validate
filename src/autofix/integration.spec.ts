import { describe, expect, it } from "@jest/globals";
import { Config } from "../config";
import { type HtmlElement } from "../dom";
import { type Location } from "../location";
import { Parser } from "../parser";
import { applyTextEdits } from "./apply-text-edits";
import { autofixCollectEdits } from "./autofix-collect-edits";
import { createAutofix } from "./create-autofix";
import { TextEditKind } from "./text-edit";

function location(offset: number, size: number): Location {
	return { filename: "test.html", offset, line: 1, column: offset + 1, size };
}

describe("insertTextBefore()", () => {
	it("should insert text at start of location", async () => {
		expect.assertions(1);
		const text = "lorem ipsum dolor sit amet";
		const offset = text.indexOf("ipsum");
		const size = "ipsum".length;
		const fix = createAutofix(text, (fixer): void => {
			fixer.insertTextBefore(location(offset, size), "before");
		});
		const edits = await autofixCollectEdits(fix);
		const result = applyTextEdits(text, edits);
		expect(result).toBe("lorem beforeipsum dolor sit amet");
	});
});

describe("insertTextAfter()", () => {
	it("should insert text at end of location", async () => {
		expect.assertions(1);
		const text = "lorem ipsum dolor sit amet";
		const offset = text.indexOf("ipsum");
		const size = "ipsum".length;
		const fix = createAutofix(text, (fixer): void => {
			fixer.insertTextAfter(location(offset, size), "after");
		});
		const edits = await autofixCollectEdits(fix);
		const result = applyTextEdits(text, edits);
		expect(result).toBe("lorem ipsumafter dolor sit amet");
	});
});

describe("renameTag()", () => {
	async function parse(markup: string): Promise<HtmlElement> {
		const parser = new Parser(await Config.empty().resolve());
		return parser.parseHtml(markup);
	}

	async function rename(
		markup: string,
		select: (root: HtmlElement) => HtmlElement[],
		newName: string,
	): Promise<string> {
		const root = await parse(markup);
		const fix = createAutofix(markup, (fixer) => {
			for (const element of select(root)) {
				fixer.renameTag(element, newName);
			}
		});
		const edits = await autofixCollectEdits(fix);
		return applyTextEdits(markup, edits);
	}

	it("should rename both start and end tag", async () => {
		expect.assertions(1);
		const result = await rename("<div></div>", (root) => root.querySelectorAll("div"), "span");
		expect(result).toBe("<span></span>");
	});

	it("should emit replace edits for start and end tag", async () => {
		expect.assertions(1);
		const markup = "<div></div>";
		const root = await parse(markup);
		const div = root.querySelector("div");
		if (!div) {
			throw new Error("expected <div> to exist");
		}
		const fix = createAutofix(markup, (fixer) => {
			fixer.renameTag(div, "span");
		});
		const edits = await autofixCollectEdits(fix);
		expect(edits).toEqual([
			{ kind: TextEditKind.Replace, location: { offset: 7, size: 3 }, replacement: "span" },
			{ kind: TextEditKind.Replace, location: { offset: 1, size: 3 }, replacement: "span" },
		]);
	});

	it("should keep attributes intact", async () => {
		expect.assertions(1);
		const result = await rename(
			'<div id="foo" class="bar" hidden data-x=\'y\'>text</div>',
			(root) => root.querySelectorAll("div"),
			"span",
		);
		expect(result).toBe('<span id="foo" class="bar" hidden data-x=\'y\'>text</span>');
	});

	it("should keep attributes that are invalid on the new element", async () => {
		expect.assertions(1);
		const result = await rename(
			'<div href="foo" for="bar"></div>',
			(root) => root.querySelectorAll("div"),
			"p",
		);
		expect(result).toBe('<p href="foo" for="bar"></p>');
	});

	it("should rename shorter and longer names", async () => {
		expect.assertions(2);
		const shorter = await rename(
			"<section></section>",
			(root) => root.querySelectorAll("section"),
			"b",
		);
		const longer = await rename("<b></b>", (root) => root.querySelectorAll("b"), "blockquote");
		expect(shorter).toBe("<b></b>");
		expect(longer).toBe("<blockquote></blockquote>");
	});

	it("should rename end tag on another line", async () => {
		expect.assertions(1);
		const result = await rename(
			'<div\n  id="foo"\n>\n  text\n</div\n>',
			(root) => root.querySelectorAll("div"),
			"span",
		);
		expect(result).toBe('<span\n  id="foo"\n>\n  text\n</span\n>');
	});

	it("should rename nested elements", async () => {
		expect.assertions(1);
		const result = await rename(
			"<div><div>foo</div></div>",
			(root) => root.querySelectorAll("div"),
			"span",
		);
		expect(result).toBe("<span><span>foo</span></span>");
	});

	it("should rename only the start tag for void element", async () => {
		expect.assertions(1);
		const result = await rename("<input>", (root) => root.querySelectorAll("input"), "button");
		expect(result).toBe("<button>");
	});

	it("should rename only the start tag for self-closed element", async () => {
		expect.assertions(1);
		const result = await rename(
			'<input id="foo"/>',
			(root) => root.querySelectorAll("input"),
			"button",
		);
		expect(result).toBe('<button id="foo"/>');
	});

	it("should rename only the start tag for element with omitted end tag", async () => {
		expect.assertions(1);
		const result = await rename(
			"<ul><li>foo<li>bar</ul>",
			(root) => root.querySelectorAll("li"),
			"div",
		);
		expect(result).toBe("<ul><div>foo<div>bar</ul>");
	});

	it("should rename only the start tag for element left open at end of file", async () => {
		expect.assertions(1);
		const result = await rename("<div>foo", (root) => root.querySelectorAll("div"), "span");
		expect(result).toBe("<span>foo");
	});

	it("should rename only the element with an end tag when others are implicitly closed", async () => {
		expect.assertions(1);
		const result = await rename(
			"<table><tr><td>foo</table>",
			(root) => root.querySelectorAll("table"),
			"div",
		);
		expect(result).toBe("<div><tr><td>foo</div>");
	});

	it.each([
		["<DIV></div>", "<span></span>"],
		["<div></DIV>", "<span></span>"],
	])("should rename both tags when end tag differs in case (%s)", async (markup, expected) => {
		expect.assertions(1);
		const result = await rename(markup, (root) => root.querySelectorAll("div"), "span");
		expect(result).toBe(expected);
	});

	it("should rename foreign element", async () => {
		expect.assertions(1);
		const result = await rename(
			"<svg><circle/></svg>",
			(root) => root.querySelectorAll("svg"),
			"div",
		);
		expect(result).toBe("<div><circle/></div>");
	});

	it("should not emit edits for implicitly opened element", async () => {
		expect.assertions(2);
		const markup = "<html><p>foo</p></html>";
		const root = await parse(markup);
		const body = root.querySelector("body");
		if (!body) {
			throw new Error("expected implicit <body> to exist");
		}
		const fix = createAutofix(markup, (fixer) => {
			fixer.renameTag(body, "main");
		});
		expect(body.implicit).toBeTruthy();
		expect(await autofixCollectEdits(fix)).toEqual([]);
	});

	it("should not emit edits for root element", async () => {
		expect.assertions(1);
		const markup = "<div></div>";
		const root = await parse(markup);
		const fix = createAutofix(markup, (fixer) => {
			fixer.renameTag(root, "span");
		});
		expect(await autofixCollectEdits(fix)).toEqual([]);
	});

	it("should combine with other edits", async () => {
		expect.assertions(1);
		const markup = '<div id="foo">text</div>';
		const root = await parse(markup);
		const [div] = root.querySelectorAll("div");
		const fix = createAutofix(markup, (fixer) => {
			fixer.renameTag(div, "span");
			const attr = div.getAttribute("id");
			if (attr) {
				fixer.removeText(attr.location, { trimStart: true });
			}
		});
		const edits = await autofixCollectEdits(fix);
		expect(applyTextEdits(markup, edits)).toBe("<span>text</span>");
	});
});
