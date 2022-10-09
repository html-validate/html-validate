import { Config } from "../../config";
import { Location } from "../../context";
import { DynamicValue } from "../../dom";
import { Parser } from "../../parser";
import { classifyNodeText, TextClassification } from "./text";

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
		const node = parser.parseHtml("<p>lorem ipsum</p>").querySelector("p");
		expect(classifyNodeText(node)).toEqual(TextClassification.STATIC_TEXT);
	});

	it("should classify element with descendant text as STATIC_TEXT", () => {
		expect.assertions(1);
		const node = parser.parseHtml("<p><b>lorem ipsum</b></p>").querySelector("p");
		expect(classifyNodeText(node)).toEqual(TextClassification.STATIC_TEXT);
	});

	it("should classify element without text as EMPTY_TEXT", () => {
		expect.assertions(1);
		const node = parser.parseHtml("<p></p>").querySelector("p");
		expect(classifyNodeText(node)).toEqual(TextClassification.EMPTY_TEXT);
	});

	it("should classify element with only whitespace as EMPTY_TEXT", () => {
		expect.assertions(1);
		const node = parser.parseHtml("<p> </p>").querySelector("p");
		expect(classifyNodeText(node)).toEqual(TextClassification.EMPTY_TEXT);
	});

	it("should classify element with dynamic text as DYNAMIC_TEXT", () => {
		expect.assertions(1);
		const node = parser.parseHtml("<p></p>").querySelector("p");
		node.appendText(new DynamicValue(""), location);
		expect(classifyNodeText(node)).toEqual(TextClassification.DYNAMIC_TEXT);
	});

	it("should classify element with descendant dynamic text as DYNAMIC_TEXT", () => {
		expect.assertions(1);
		const node = parser.parseHtml("<p>foo <b></b> bar</p>").querySelector("p");
		node.querySelector("b").appendText(new DynamicValue(""), location);
		expect(classifyNodeText(node)).toEqual(TextClassification.DYNAMIC_TEXT);
	});

	it("should classify <select> as EMPTY_TEXT", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<select>
				<option>foobar</option>
			</select>
		`;
		const node = parser.parseHtml(markup).querySelector("select");
		expect(classifyNodeText(node)).toEqual(TextClassification.EMPTY_TEXT);
	});

	it("should classify <textarea> as EMPTY_TEXT", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <textarea>lorem ipsum</textarea> `;
		const node = parser.parseHtml(markup).querySelector("textarea");
		expect(classifyNodeText(node)).toEqual(TextClassification.EMPTY_TEXT);
	});

	it("should cache result", () => {
		expect.assertions(2);
		const node = parser.parseHtml("<p>foo</p>").querySelector("p");
		expect(classifyNodeText(node)).toEqual(TextClassification.STATIC_TEXT);
		node.childNodes.length = 0; /* hack to remove all text content */
		expect(classifyNodeText(node)).toEqual(TextClassification.STATIC_TEXT);
	});
});
