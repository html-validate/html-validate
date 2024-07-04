import { Config } from "../config";
import { type Location } from "../context";
import { Parser } from "../parser";
import { DOMNode } from "./domnode";
import { HtmlElement, NodeClosed } from "./htmlelement";
import { NodeType } from "./nodetype";
import { TextNode } from "./text";

const location: Location = {
	filename: "inline",
	line: 1,
	column: 1,
	offset: 0,
	size: 1,
};

describe("DOMNode", () => {
	it("should set nodeName and nodeType", () => {
		expect.assertions(2);
		const node = new DOMNode(NodeType.ELEMENT_NODE, "foo", location);
		expect(node.nodeName).toBe("foo");
		expect(node.nodeType).toEqual(NodeType.ELEMENT_NODE);
	});

	it("should be assigned a unique id", () => {
		expect.assertions(3);
		const n1 = new DOMNode(NodeType.ELEMENT_NODE, "foo", location);
		const n2 = new DOMNode(NodeType.ELEMENT_NODE, "foo", location);
		expect(n1.unique).toEqual(expect.any(Number));
		expect(n2.unique).toEqual(expect.any(Number));
		expect(n1.unique === n2.unique).toBeFalsy();
	});

	it("root element", () => {
		expect.assertions(2);
		const node = new DOMNode(NodeType.DOCUMENT_NODE, "#document", location);
		expect(node.nodeName).toBe("#document");
		expect(node.nodeType).toEqual(NodeType.DOCUMENT_NODE);
	});

	it("append() should add node as child", () => {
		expect.assertions(3);
		const parent = new DOMNode(NodeType.ELEMENT_NODE, "parent", location);
		const child = new DOMNode(NodeType.ELEMENT_NODE, "child", location);
		expect(parent.childNodes).toHaveLength(0);
		parent.append(child);
		expect(parent.childNodes).toHaveLength(1);
		expect(parent.childNodes[0].unique).toEqual(child.unique);
	});

	describe("isRootElement()", () => {
		it("should return true for root element", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.DOCUMENT_NODE, "#document", location);
			expect(node.isRootElement()).toBeTruthy();
		});
		it("should false true for other element", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "foo", location);
			expect(node.isRootElement()).toBeFalsy();
		});
	});

	describe("isSameNode()", () => {
		const a = new DOMNode(NodeType.ELEMENT_NODE, "div", location);
		const b = new DOMNode(NodeType.ELEMENT_NODE, "div", location);

		it("should return true if the element references the same node", () => {
			expect.assertions(1);
			expect(a.isSameNode(a)).toBeTruthy();
		});

		it("should return false if the element is another node", () => {
			expect.assertions(1);
			expect(a.isSameNode(b)).toBeFalsy();
		});
	});

	describe("firstChild", () => {
		it("should return first child if present", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "root", location);
			const first = new DOMNode(NodeType.ELEMENT_NODE, "first", location);
			const last = new DOMNode(NodeType.ELEMENT_NODE, "last", location);
			node.append(first);
			node.append(last);
			expect(node.firstChild.unique).toEqual(first.unique);
		});
		it("should return null if no children present", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "root", location);
			expect(node.firstChild).toBeNull();
		});
	});

	describe("lastChild", () => {
		it("should return first child if present", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "root", location);
			const first = new DOMNode(NodeType.ELEMENT_NODE, "first", location);
			const last = new DOMNode(NodeType.ELEMENT_NODE, "last", location);
			node.append(first);
			node.append(last);
			expect(node.lastChild.unique).toEqual(last.unique);
		});
		it("should return null if no children present", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "root", location);
			expect(node.lastChild).toBeNull();
		});
	});

	describe("textContent", () => {
		it("should get text from children", () => {
			expect.assertions(1);
			const root = new HtmlElement("root", null, NodeClosed.EndTag, null, location);
			const a = new HtmlElement("a", root, NodeClosed.EndTag, null, location);
			const b = new HtmlElement("b", root, NodeClosed.EndTag, null, location);
			a.appendText("foo", location);
			b.appendText("bar", location);
			expect(root.textContent).toBe("foobar");
		});

		it("should get text from children (recursive)", () => {
			expect.assertions(1);
			const root = new HtmlElement("root", null, NodeClosed.EndTag, null, location);
			const a = new HtmlElement("a", root, NodeClosed.EndTag, null, location);
			const b = new HtmlElement("b", root, NodeClosed.EndTag, null, location);
			const c = new HtmlElement("b", b, NodeClosed.EndTag, null, location);
			a.appendText("foo", location);
			c.appendText("bar", location);
			expect(root.textContent).toBe("foobar");
		});

		it("should get text from children intermixed with text", () => {
			expect.assertions(1);
			const root = new HtmlElement("root", null, NodeClosed.EndTag, null, location);
			const a = new HtmlElement("a", null, NodeClosed.EndTag, null, location);
			const b = new TextNode(" bar ", location);
			const c = new HtmlElement("c", null, NodeClosed.EndTag, null, location);
			a.appendText("foo", location);
			c.appendText("baz", location);
			root.append(a);
			root.append(b);
			root.append(c);
			expect(root.textContent).toBe("foo bar baz");
		});

		it("smoketest", () => {
			expect.assertions(1);
			const markup = `lorem <i>ipsum</i> <b>dolor <u>sit amet</u></b>`;
			const parser = new Parser(Config.empty().resolve());
			const doc = parser.parseHtml(markup);
			expect(doc.textContent).toBe("lorem ipsum dolor sit amet");
		});
	});

	describe("disabled rules", () => {
		it("rules should default to enabled", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "foo", location);
			expect(node.ruleEnabled("my-rule")).toBeTruthy();
		});

		it("disableRule() should disable rule", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "foo", location);
			node.disableRule("my-rule");
			expect(node.ruleEnabled("my-rule")).toBeFalsy();
		});

		it("enableRule() should enable rule", () => {
			expect.assertions(2);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "foo", location);
			node.disableRule("my-rule");
			expect(node.ruleEnabled("my-rule")).toBeFalsy();
			node.enableRule("my-rule");
			expect(node.ruleEnabled("my-rule")).toBeTruthy();
		});
	});

	describe("generateSelector()", () => {
		it("should default to return null", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.TEXT_NODE, "#text", location);
			expect(node.generateSelector()).toBeNull();
		});
	});

	describe("cache", () => {
		it("should not cache until enabled", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "div", location);
			node.cacheSet("foo", 1);
			expect(node.cacheGet("foo")).toBeUndefined();
		});

		it("cacheGet() should return undefined when no value is cached", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "div", location);
			node.cacheEnable();
			expect(node.cacheGet("foo")).toBeUndefined();
		});

		it("cacheGet() should get value set with cacheSet()", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "div", location);
			node.cacheEnable();
			node.cacheSet("foo", 1);
			expect(node.cacheGet("foo")).toBe(1);
		});

		it("cacheSet() should return value", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "div", location);
			node.cacheEnable();
			expect(node.cacheSet("foo", 1)).toBe(1);
		});

		it("cacheSet() should overwrite previous value", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "div", location);
			node.cacheEnable();
			node.cacheSet("foo", 1);
			node.cacheSet("foo", 2);
			expect(node.cacheGet("foo")).toBe(2);
		});

		it("should cache values per instance", () => {
			expect.assertions(4);
			const a = new DOMNode(NodeType.ELEMENT_NODE, "div", location);
			const b = new DOMNode(NodeType.ELEMENT_NODE, "div", location);
			a.cacheEnable();
			b.cacheEnable();
			expect(a.cacheGet("foo")).toBeUndefined();
			expect(b.cacheGet("foo")).toBeUndefined();
			a.cacheSet("foo", 1);
			b.cacheSet("foo", 2);
			expect(a.cacheGet("foo")).toBe(1);
			expect(b.cacheGet("foo")).toBe(2);
		});

		it("cacheRemove() should remove value from cache", () => {
			expect.assertions(4);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "div", location);
			node.cacheEnable();
			node.cacheSet("foo", 1);
			expect(node.cacheExists("foo")).toBeTruthy();
			expect(node.cacheGet("foo")).toBe(1);
			node.cacheRemove("foo");
			expect(node.cacheExists("foo")).toBeFalsy();
			expect(node.cacheGet("foo")).toBeUndefined();
		});

		it("cacheRemove() should return true if value existed", () => {
			expect.assertions(3);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "div", location);
			node.cacheEnable();
			node.cacheSet("foo", 1);
			expect(node.cacheRemove("foo")).toBeTruthy();
			expect(node.cacheRemove("foo")).toBeFalsy();
			expect(node.cacheRemove("bar")).toBeFalsy();
		});

		it("cacheRemove() should return false if cache is disabled", () => {
			expect.assertions(1);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "div", location);
			node.cacheSet("foo", 1);
			expect(node.cacheRemove("foo")).toBeFalsy();
		});

		it("cacheExists() should return true if value is cached", () => {
			expect.assertions(2);
			const node = new DOMNode(NodeType.ELEMENT_NODE, "div", location);
			node.cacheEnable();
			node.cacheSet("foo", 1);
			expect(node.cacheExists("foo")).toBeTruthy();
			expect(node.cacheExists("bar")).toBeFalsy();
		});
	});
});
