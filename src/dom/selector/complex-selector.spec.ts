import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Config } from "../../config";
import { Parser } from "../../parser";
import { reset as resetDOMCounter } from "../domnode";
import { type HtmlElement } from "../htmlelement";
import { type NodeType } from "../nodetype";
import { ComplexSelector } from "./complex-selector";
import { generateIdSelector } from "./generate-id-selector";

interface StrippedHtmlElement {
	id: string | null;
	class: string | null;
	nodeName: string;
	nodeType: NodeType;
	tagName: string;
	unique: number;
	testId: string | null;
}

function stripHtmlElement(node: HtmlElement): StrippedHtmlElement {
	return {
		id: node.id,
		class: node.hasAttribute("class") ? node.classList.join(" ") : null,
		nodeName: node.nodeName,
		nodeType: node.nodeType,
		tagName: node.tagName,
		unique: node.unique,
		testId: node.getAttributeValue("test-id"),
	};
}

function fetch(it: IterableIterator<HtmlElement>): StrippedHtmlElement[] {
	return Array.from(it, stripHtmlElement);
}

describe("Selector", () => {
	let doc: HtmlElement;

	beforeEach(async () => {
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		doc = parser.parseHtml(`
			<foo id="barney" test-id="foo-1">first foo</foo>
			<foo CLASS="fred" test-id="foo-2">second foo</foo>
			<bar test-id="bar-1">

				<!-- not valid but verify selectors can handle it -->
				<baz class="a" class="fred" class="b" test-id="baz-1">
					<foo test-id="foo-3">third foo</foo>
				</baz>

				<foo wilma="flintstone" lorem-123-ipsum="dolor-sit-amet" test-id="foo-4">forth foo</foo>
				<spam wilma="rubble" boolean test-id="spam-1"></spam>
				<baz test-id="baz-2"></baz>
			</bar>
		`);
	});

	afterEach(() => {
		resetDOMCounter();
	});

	it("should match tagName (foo)", () => {
		expect.assertions(1);
		const selector = ComplexSelector.fromString("foo");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-1" }),
			expect.objectContaining({ tagName: "foo", testId: "foo-2" }),
			expect.objectContaining({ tagName: "foo", testId: "foo-3" }),
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match descendant (bar foo)", () => {
		expect.assertions(1);
		const selector = ComplexSelector.fromString("bar foo");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-3" }),
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match child (bar > foo)", () => {
		expect.assertions(1);
		const selector = ComplexSelector.fromString("bar > foo");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match adjacent sibling (baz + foo)", () => {
		expect.assertions(1);
		const selector = ComplexSelector.fromString("baz + foo");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match general sibling (foo ~ baz)", () => {
		expect.assertions(1);
		const selector = ComplexSelector.fromString("foo ~ baz");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "baz", testId: "baz-2" }),
		]);
	});

	it("should match class (.fred)", () => {
		expect.assertions(1);
		const selector = ComplexSelector.fromString(".fred");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-2" }),
			expect.objectContaining({ tagName: "baz", testId: "baz-1" }),
		]);
	});

	it("should match id (#barney)", () => {
		expect.assertions(1);
		const selector = ComplexSelector.fromString("#barney");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-1" }),
		]);
	});

	it("should match id with escaped colon", async () => {
		expect.assertions(1);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		const document = parser.parseHtml(`<div id="foo:"></div>`);
		const selector = ComplexSelector.fromString("#foo\\:");
		expect(fetch(selector.match(document))).toEqual([expect.objectContaining({ tagName: "div" })]);
	});

	it("should match id with escaped space", async () => {
		expect.assertions(1);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		const document = parser.parseHtml(`<div id="foo "></div>`);
		const selector = ComplexSelector.fromString("#foo\\ ");
		expect(fetch(selector.match(document))).toEqual([expect.objectContaining({ tagName: "div" })]);
	});

	it("should match id with escaped tab", async () => {
		expect.assertions(1);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		const document = parser.parseHtml(`<div id="foo\t"></div>`);
		const selector = ComplexSelector.fromString("#foo\\9 ");
		expect(fetch(selector.match(document))).toEqual([expect.objectContaining({ tagName: "div" })]);
	});

	it("should match id with escaped newline (\\n)", async () => {
		expect.assertions(1);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		const document = parser.parseHtml(`<div id="foo\n"></div>`);
		const selector = ComplexSelector.fromString("#foo\\a ");
		expect(fetch(selector.match(document))).toEqual([expect.objectContaining({ tagName: "div" })]);
	});

	it("should match id with escaped newline (\\r)", async () => {
		expect.assertions(1);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		const document = parser.parseHtml(`<div id="foo\r"></div>`);
		const selector = ComplexSelector.fromString("#foo\\d ");
		expect(fetch(selector.match(document))).toEqual([expect.objectContaining({ tagName: "div" })]);
	});

	it("should match id with escaped bracket", async () => {
		expect.assertions(1);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		const document = parser.parseHtml(`<div id="foo[bar]"></div>`);
		const selector = ComplexSelector.fromString("#foo\\[bar\\]");
		expect(fetch(selector.match(document))).toEqual([expect.objectContaining({ tagName: "div" })]);
	});

	it("should match id with leading number", async () => {
		expect.assertions(2);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		const document = parser.parseHtml(`<div id="1foo"></div>`);
		const text = generateIdSelector("1foo");
		const selector = ComplexSelector.fromString(text);
		expect(text).toBe('[id="1foo"]');
		expect(fetch(selector.match(document))).toEqual([expect.objectContaining({ tagName: "div" })]);
	});

	it("should match id with comma", async () => {
		expect.assertions(2);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		const document = parser.parseHtml(`<div id="foo,bar"></div>`);
		const text = generateIdSelector("foo,bar");
		const selector = ComplexSelector.fromString(text);
		expect(text).toBe("#foo\\,bar");
		expect(fetch(selector.match(document))).toEqual([expect.objectContaining({ tagName: "div" })]);
	});

	it("should match id with leading number and comma", async () => {
		expect.assertions(2);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		const document = parser.parseHtml(`<div id="1foo,bar"></div>`);
		const text = generateIdSelector("1foo,bar");
		const selector = ComplexSelector.fromString(text);
		expect(text).toBe('[id="1foo\\,bar"]');
		expect(fetch(selector.match(document))).toEqual([expect.objectContaining({ tagName: "div" })]);
	});

	it("should match having attribute ([wilma])", () => {
		expect.assertions(1);
		const selector = ComplexSelector.fromString("[wilma]");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
			expect.objectContaining({ tagName: "spam", testId: "spam-1" }),
		]);
	});

	it("should match having boolean attribute ([boolean])", () => {
		expect.assertions(1);
		const selector = ComplexSelector.fromString("[boolean]");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "spam", testId: "spam-1" }),
		]);
	});

	it("should match having attribute with dashes and numbers ([lorem-123-ipsum])", () => {
		expect.assertions(1);
		const selector = ComplexSelector.fromString("[lorem-123-ipsum]");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it('should match attribute value ([wilma="flintstone"])', () => {
		expect.assertions(1);
		const selector = ComplexSelector.fromString('[wilma="flintstone"]');
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it('should match nested : in string ([id=":r1:"])', async () => {
		expect.assertions(1);
		const resolvedConfig = await Config.empty().resolve();
		const parser = new Parser(resolvedConfig);
		doc = parser.parseHtml(/* HTML */ ` <label id="#r1:"> lorem ipsum </label> `);
		const element = doc.querySelector("label")!;
		const id = element.id;
		const selector = ComplexSelector.fromString('[id="#r1:"]');
		expect(Array.from(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "label", id }),
		]);
	});

	it('should match attribute value with special characters ([lorem-123-ipsum="dolor-sit-amet"])', () => {
		expect.assertions(1);
		const selector = ComplexSelector.fromString('[lorem-123-ipsum="dolor-sit-amet"]');
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match attribute value on duplicated attributes", () => {
		expect.assertions(2);
		const selectorA = ComplexSelector.fromString('[class="a"]');
		const selectorB = ComplexSelector.fromString('[class="b"]');
		expect(fetch(selectorA.match(doc))).toEqual([
			expect.objectContaining({ tagName: "baz", testId: "baz-1" }),
		]);
		expect(fetch(selectorB.match(doc))).toEqual([
			expect.objectContaining({ tagName: "baz", testId: "baz-1" }),
		]);
	});

	it("should match multiple attributes ([wilma][lorem-123-ipsum])", () => {
		expect.assertions(1);
		const selector = ComplexSelector.fromString("[wilma][lorem-123-ipsum]");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should match pseudo-classes", () => {
		expect.assertions(1);
		const selector = ComplexSelector.fromString("foo:first-child");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-1" }),
			expect.objectContaining({ tagName: "foo", testId: "foo-3" }),
		]);
	});

	it("should match pseudo-classes with arguments", () => {
		expect.assertions(1);
		const selector = ComplexSelector.fromString("foo:nth-child(1)");
		expect(fetch(selector.match(doc))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-1" }),
			expect.objectContaining({ tagName: "foo", testId: "foo-3" }),
		]);
	});

	it("should match with :scope", () => {
		expect.assertions(1);
		const element = doc.querySelector("bar")!;
		const selector = ComplexSelector.fromString(":scope > foo");
		expect(fetch(selector.match(element))).toEqual([
			expect.objectContaining({ tagName: "foo", testId: "foo-4" }),
		]);
	});

	it("should throw error for missing pseudo-class", () => {
		expect.assertions(1);
		expect(() => ComplexSelector.fromString("foo:")).toThrow(
			'Missing pseudo-class after colon in selector pattern "foo:"',
		);
	});

	it("should throw error for invalid pseudo-classes", () => {
		expect.assertions(1);
		const selector = ComplexSelector.fromString("foo:missing");
		expect(() => fetch(selector.match(doc))).toThrow('Pseudo-class "missing" is not implemented');
	});
});
