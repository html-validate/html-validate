import { Config } from "../config";
import { Parser } from "../parser";
import { DOMNode } from "./domnode";
import { HtmlElement } from "./htmlelement";
import { NodeType } from "./nodetype";
import { TextNode } from "./text";

describe("DOMNode", () => {
	it("should set nodeName and nodeType", () => {
		expect.assertions(2);
		const node = new DOMNode(NodeType.ELEMENT_NODE, "foo");
		expect(node.nodeName).toEqual("foo");
		expect(node.nodeType).toEqual(NodeType.ELEMENT_NODE);
	});

	it("should be assigned a unique id", () => {
		expect.assertions(3);
		const n1 = new DOMNode(NodeType.ELEMENT_NODE, "foo");
		const n2 = new DOMNode(NodeType.ELEMENT_NODE, "foo");
		expect(n1.unique).toEqual(expect.any(Number));
		expect(n2.unique).toEqual(expect.any(Number));
		expect(n1.unique === n2.unique).toBeFalsy();
	});

	it("root element", () => {
		expect.assertions(2);
		const node = new DOMNode(NodeType.DOCUMENT_NODE, "#document");
		expect(node.nodeName).toEqual("#document");
		expect(node.nodeType).toEqual(NodeType.DOCUMENT_NODE);
	});

	it("append() should add node as child", () => {
		expect.assertions(3);
		const parent = new DOMNode(NodeType.ELEMENT_NODE, "parent");
		const child = new DOMNode(NodeType.ELEMENT_NODE, "child");
		expect(parent.childNodes).toHaveLength(0);
		parent.append(child);
		expect(parent.childNodes).toHaveLength(1);
		expect(parent.childNodes[0].unique).toEqual(child.unique);
	});

	describe("isRootElement()", () => {
		it("should return true for root element", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.DOCUMENT_NODE, "#document");
			expect(node.isRootElement()).toBeTruthy();
		});
		it("should false true for other element", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "foo");
			expect(node.isRootElement()).toBeFalsy();
		});
	});

	describe("firstChild", () => {
		it("should return first child if present", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "root");
			const first = new DOMNode(NodeType.ELEMENT_NODE, "first");
			const last = new DOMNode(NodeType.ELEMENT_NODE, "last");
			node.append(first);
			node.append(last);
			expect(node.firstChild.unique).toEqual(first.unique);
		});
		it("should return null if no children present", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "root");
			expect(node.firstChild).toBeNull();
		});
	});

	describe("lastChild", () => {
		it("should return first child if present", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "root");
			const first = new DOMNode(NodeType.ELEMENT_NODE, "first");
			const last = new DOMNode(NodeType.ELEMENT_NODE, "last");
			node.append(first);
			node.append(last);
			expect(node.lastChild.unique).toEqual(last.unique);
		});
		it("should return null if no children present", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "root");
			expect(node.lastChild).toBeNull();
		});
	});

	describe("textContent", () => {
		it("should get text from children", () => {
			expect.assertions(1);
			const root = new HtmlElement("root");
			const a = new HtmlElement("a", root);
			const b = new HtmlElement("b", root);
			a.appendText("foo");
			b.appendText("bar");
			expect(root.textContent).toEqual("foobar");
		});

		it("should get text from children (recursive)", () => {
			expect.assertions(1);
			const root = new HtmlElement("root");
			const a = new HtmlElement("a", root);
			const b = new HtmlElement("b", root);
			const c = new HtmlElement("b", b);
			a.appendText("foo");
			c.appendText("bar");
			expect(root.textContent).toEqual("foobar");
		});

		it("should get text from children intermixed with text", () => {
			expect.assertions(1);
			const root = new HtmlElement("root");
			const a = new HtmlElement("a");
			const b = new TextNode(" bar ");
			const c = new HtmlElement("c");
			a.appendText("foo");
			c.appendText("baz");
			root.append(a);
			root.append(b);
			root.append(c);
			expect(root.textContent).toEqual("foo bar baz");
		});

		it("smoketest", () => {
			expect.assertions(1);
			const markup = `lorem <i>ipsum</i> <b>dolor <u>sit amet</u></b>`;
			const parser = new Parser(Config.empty().resolve());
			const doc = parser.parseHtml(markup).root;
			expect(doc.textContent).toEqual("lorem ipsum dolor sit amet");
		});
	});

	describe("disabled rules", () => {
		it("rules should default to enabled", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "foo");
			expect(node.ruleEnabled("my-rule")).toBeTruthy();
		});

		it("disableRule() should disable rule", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "foo");
			node.disableRule("my-rule");
			expect(node.ruleEnabled("my-rule")).toBeFalsy();
		});

		it("enableRule() should enable rule", () => {
			expect.assertions(2);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "foo");
			node.disableRule("my-rule");
			expect(node.ruleEnabled("my-rule")).toBeFalsy();
			node.enableRule("my-rule");
			expect(node.ruleEnabled("my-rule")).toBeTruthy();
		});
	});

	describe("generateSelector()", () => {
		it("should default to return null", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.TEXT_NODE, "#text");
			expect(node.generateSelector()).toBeNull();
		});
	});

	describe("cache", () => {
		it("cacheGet() should return undefined when no value is cached", () => {
			expect.assertions(1);
			const a = new DOMNode(NodeType.ELEMENT_NODE, "a");
			expect(a.cacheGet("foo")).toBeUndefined();
		});

		it("cacheGet() should get value set with cacheSet()", () => {
			expect.assertions(1);
			const a = new DOMNode(NodeType.ELEMENT_NODE, "a");
			a.cacheSet("foo", 1);
			expect(a.cacheGet("foo")).toEqual(1);
		});

		it("cacheSet() should return value", () => {
			expect.assertions(1);
			const a = new DOMNode(NodeType.ELEMENT_NODE, "a");
			expect(a.cacheSet("foo", 1)).toEqual(1);
		});

		it("cacheSet() should overwrite previous value", () => {
			expect.assertions(1);
			const a = new DOMNode(NodeType.ELEMENT_NODE, "a");
			a.cacheSet("foo", 1);
			a.cacheSet("foo", 2);
			expect(a.cacheGet("foo")).toEqual(2);
		});

		it("should cache values per instance", () => {
			expect.assertions(4);
			const a = new DOMNode(NodeType.ELEMENT_NODE, "a");
			const b = new DOMNode(NodeType.ELEMENT_NODE, "a");
			expect(a.cacheGet("foo")).toBeUndefined();
			expect(b.cacheGet("foo")).toBeUndefined();
			a.cacheSet("foo", 1);
			b.cacheSet("foo", 2);
			expect(a.cacheGet("foo")).toEqual(1);
			expect(b.cacheGet("foo")).toEqual(2);
		});

		it("cacheRemove() should remove value from cache", () => {
			expect.assertions(4);
			const a = new DOMNode(NodeType.ELEMENT_NODE, "a");
			a.cacheSet("foo", 1);
			expect(a.cacheExists("foo")).toBeTruthy();
			expect(a.cacheGet("foo")).toEqual(1);
			a.cacheRemove("foo");
			expect(a.cacheExists("foo")).toBeFalsy();
			expect(a.cacheGet("foo")).toBeUndefined();
		});

		it("cacheRemove() should return true if value existed", () => {
			expect.assertions(3);
			const a = new DOMNode(NodeType.ELEMENT_NODE, "a");
			a.cacheSet("foo", 1);
			expect(a.cacheRemove("foo")).toBeTruthy();
			expect(a.cacheRemove("foo")).toBeFalsy();
			expect(a.cacheRemove("bar")).toBeFalsy();
		});

		it("cacheExists() should return true if value is cached", () => {
			expect.assertions(2);
			const a = new DOMNode(NodeType.ELEMENT_NODE, "a");
			a.cacheSet("foo", 1);
			expect(a.cacheExists("foo")).toBeTruthy();
			expect(a.cacheExists("bar")).toBeFalsy();
		});
	});
});
