import { Config } from "../../config";
import { DynamicValue } from "../../dom";
import { Parser } from "../../parser";
import { classifyNodeText, TextClassification } from "./text";

const parser = new Parser(Config.empty());

describe("classifyNodeText()", () => {
	it("should classify element with text as STATIC_TEXT", () => {
		expect.assertions(1);
		const node = parser.parseHtml("<p>lorem ipsum</p>").querySelector("p");
		expect(classifyNodeText(node)).toEqual(TextClassification.STATIC_TEXT);
	});

	it("should classify element with descendant text as STATIC_TEXT", () => {
		expect.assertions(1);
		const node = parser
			.parseHtml("<p><b>lorem ipsum</b></p>")
			.querySelector("p");
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
		node.appendText(new DynamicValue(""));
		expect(classifyNodeText(node)).toEqual(TextClassification.DYNAMIC_TEXT);
	});

	it("should classify element with descendant dynamic text as DYNAMIC_TEXT", () => {
		expect.assertions(1);
		const node = parser.parseHtml("<p>foo <b></b> bar</p>").querySelector("p");
		node.querySelector("b").appendText(new DynamicValue(""));
		expect(classifyNodeText(node)).toEqual(TextClassification.DYNAMIC_TEXT);
	});
});
