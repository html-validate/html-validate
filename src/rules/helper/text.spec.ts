import { Config } from "../../config";
import { type Location } from "../../context";
import { DynamicValue } from "../../dom";
import { Parser } from "../../parser";
import { classifyNodeText, getCachekey, TextClassification } from "./text";

const location: Location = {
	filename: "inline",
	line: 1,
	column: 1,
	offset: 0,
	size: 1,
};

const parser = new Parser(Config.empty().resolve());

describe("classifyNodeText()", () => {
	it("should classify element with text as STATIC_TEXT", () => {
		expect.assertions(1);
		const node = parser.parseHtml("<p>lorem ipsum</p>").querySelector("p")!;
		expect(classifyNodeText(node)).toEqual(TextClassification.STATIC_TEXT);
	});

	it("should classify element with descendant text as STATIC_TEXT", () => {
		expect.assertions(1);
		const node = parser.parseHtml("<p><b>lorem ipsum</b></p>").querySelector("p")!;
		expect(classifyNodeText(node)).toEqual(TextClassification.STATIC_TEXT);
	});

	it("should classify element without text as EMPTY_TEXT", () => {
		expect.assertions(1);
		const node = parser.parseHtml("<p></p>").querySelector("p")!;
		expect(classifyNodeText(node)).toEqual(TextClassification.EMPTY_TEXT);
	});

	it("should classify element with only whitespace as EMPTY_TEXT", () => {
		expect.assertions(1);
		const node = parser.parseHtml("<p> </p>").querySelector("p")!;
		expect(classifyNodeText(node)).toEqual(TextClassification.EMPTY_TEXT);
	});

	it("should classify element with dynamic text as DYNAMIC_TEXT", () => {
		expect.assertions(1);
		const node = parser.parseHtml("<p></p>").querySelector("p")!;
		node.appendText(new DynamicValue(""), location);
		expect(classifyNodeText(node)).toEqual(TextClassification.DYNAMIC_TEXT);
	});

	it("should classify element with descendant dynamic text as DYNAMIC_TEXT", () => {
		expect.assertions(1);
		const node = parser.parseHtml("<p>foo <b></b> bar</p>").querySelector("p")!;
		node.querySelector("b")!.appendText(new DynamicValue(""), location);
		expect(classifyNodeText(node)).toEqual(TextClassification.DYNAMIC_TEXT);
	});

	it("should classify hidden element as EMPTY TEXT", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p hidden>lorem ipsum</p> `;
		const node = parser.parseHtml(markup).querySelector("p")!;
		expect(classifyNodeText(node)).toEqual(TextClassification.EMPTY_TEXT);
	});

	it("should classify nested hidden element as EMPTY TEXT", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<p>
				<em hidden> lorem ipsum </em>
			</p>
		`;
		const node = parser.parseHtml(markup).querySelector("p")!;
		expect(classifyNodeText(node)).toEqual(TextClassification.EMPTY_TEXT);
	});

	it("should classify parent hidden element as EMPTY TEXT", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div hidden>
				<p>lorem ipsum</p>
			</div>
		`;
		const node = parser.parseHtml(markup).querySelector("p")!;
		expect(classifyNodeText(node)).toEqual(TextClassification.EMPTY_TEXT);
	});

	it("should classify <select> as EMPTY_TEXT", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<select>
				<option>foobar</option>
			</select>
		`;
		const node = parser.parseHtml(markup).querySelector("select")!;
		expect(classifyNodeText(node)).toEqual(TextClassification.EMPTY_TEXT);
	});

	it("should classify <textarea> as EMPTY_TEXT", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <textarea>lorem ipsum</textarea> `;
		const node = parser.parseHtml(markup).querySelector("textarea")!;
		expect(classifyNodeText(node)).toEqual(TextClassification.EMPTY_TEXT);
	});

	describe("accessible", () => {
		it("should classify aria-hidden element as EMPTY TEXT", () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <p aria-hidden="true">lorem ipsum</p> `;
			const node = parser.parseHtml(markup).querySelector("p")!;
			expect(classifyNodeText(node)).toEqual(TextClassification.STATIC_TEXT);
			expect(classifyNodeText(node, { accessible: true })).toEqual(TextClassification.EMPTY_TEXT);
		});

		it("should classify nested aria-hidden element as EMPTY TEXT", () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<p>
					<em aria-hidden="true"> lorem ipsum </em>
				</p>
			`;
			const node = parser.parseHtml(markup).querySelector("p")!;
			expect(classifyNodeText(node)).toEqual(TextClassification.STATIC_TEXT);
			expect(classifyNodeText(node, { accessible: true })).toEqual(TextClassification.EMPTY_TEXT);
		});

		it("should classify parent aria-hidden element as EMPTY TEXT", () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<div aria-hidden="true">
					<p>lorem ipsum</p>
				</div>
			`;
			const node = parser.parseHtml(markup).querySelector("p")!;
			expect(classifyNodeText(node)).toEqual(TextClassification.STATIC_TEXT);
			expect(classifyNodeText(node, { accessible: true })).toEqual(TextClassification.EMPTY_TEXT);
		});
	});

	describe("ignoreHiddenRoot", () => {
		it("should not classify hidden element as EMPTY TEXT", () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <p hidden>lorem ipsum</p> `;
			const node = parser.parseHtml(markup).querySelector("p")!;
			expect(classifyNodeText(node, { ignoreHiddenRoot: true })).toEqual(
				TextClassification.STATIC_TEXT,
			);
		});

		it("should classify nested hidden element as EMPTY TEXT", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<p>
					<em hidden> lorem ipsum </em>
				</p>
			`;
			const node = parser.parseHtml(markup).querySelector("p")!;
			expect(classifyNodeText(node, { ignoreHiddenRoot: true })).toEqual(
				TextClassification.EMPTY_TEXT,
			);
		});

		it("should classify parent hidden element as STATIC_TEXT", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<div hidden>
					<p>lorem ipsum</p>
				</div>
			`;
			const node = parser.parseHtml(markup).querySelector("p")!;
			expect(classifyNodeText(node, { ignoreHiddenRoot: true })).toEqual(
				TextClassification.STATIC_TEXT,
			);
		});

		it("should classify parent hidden element with nested children as STATIC_TEXT", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<div hidden>
					<p>
						<em>lorem ipsum</em>
					</p>
				</div>
			`;
			const node = parser.parseHtml(markup).querySelector("p")!;
			expect(classifyNodeText(node, { ignoreHiddenRoot: true })).toEqual(
				TextClassification.STATIC_TEXT,
			);
		});
	});

	describe("cache", () => {
		it("use use different cache keys per options", () => {
			expect.assertions(4);
			const a = getCachekey({ accessible: false, ignoreHiddenRoot: false }).description;
			const b = getCachekey({ accessible: false, ignoreHiddenRoot: true }).description;
			const c = getCachekey({ accessible: true, ignoreHiddenRoot: false }).description;
			const d = getCachekey({ accessible: true, ignoreHiddenRoot: true }).description;
			const all = [a, b, c, d];
			const count = (value: string | undefined): number => all.filter((it) => it === value).length;
			expect(count(a)).toBe(1);
			expect(count(b)).toBe(1);
			expect(count(c)).toBe(1);
			expect(count(d)).toBe(1);
		});

		it("should cache result", () => {
			expect.assertions(2);
			const node = parser.parseHtml("<p>foo</p>").querySelector("p")!;
			expect(classifyNodeText(node)).toEqual(TextClassification.STATIC_TEXT);
			node.childNodes.length = 0; /* hack to remove all text content */
			expect(classifyNodeText(node)).toEqual(TextClassification.STATIC_TEXT);
		});
	});
});
