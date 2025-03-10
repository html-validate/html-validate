import { Config } from "../config";
import { type Location } from "../context";
import { Parser } from "../parser";
import { DOMNode } from "./domnode";
import { HtmlElement } from "./htmlelement";
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

	describe("append()", () => {
		it("should add node as child", () => {
			expect.assertions(3);
			const parent = HtmlElement.createElement("parent", location);
			const child = HtmlElement.createElement("child", location);
			expect(parent.childNodes).toHaveLength(0);
			parent.append(child);
			expect(parent.childNodes).toHaveLength(1);
			expect(parent.childNodes[0].unique).toEqual(child.unique);
		});

		it("should set parent", () => {
			expect.assertions(2);
			const parent = HtmlElement.createElement("parent", location);
			const child = HtmlElement.createElement("child", location);
			expect(child.parent).toBeNull();
			parent.append(child);
			expect(child.parent?.tagName).toBe("parent");
		});

		it("should be idempotent", () => {
			expect.assertions(3);
			const parent = HtmlElement.createElement("parent", location);
			const child = HtmlElement.createElement("child", location);
			expect(parent.childNodes).toHaveLength(0);
			parent.append(child);
			parent.append(child);
			parent.append(child);
			expect(parent.childNodes).toHaveLength(1);
			expect(child.parent?.tagName).toBe("parent");
		});

		it("should replace existing parent", () => {
			expect.assertions(8);
			const oldParent = HtmlElement.createElement("old", location);
			const newParent = HtmlElement.createElement("new", location);
			const child = HtmlElement.createElement("child", location);
			expect(oldParent.childNodes).toHaveLength(0);
			expect(newParent.childNodes).toHaveLength(0);
			oldParent.append(child);
			expect(oldParent.childNodes).toHaveLength(1);
			expect(newParent.childNodes).toHaveLength(0);
			expect(child.parent?.tagName).toBe("old");
			newParent.append(child);
			expect(oldParent.childNodes).toHaveLength(0);
			expect(newParent.childNodes).toHaveLength(1);
			expect(child.parent?.tagName).toBe("new");
		});
	});

	describe("insertBefore", () => {
		it("should insert node before reference node", () => {
			expect.assertions(5);
			const parent = HtmlElement.createElement("parent", location);
			const a = HtmlElement.createElement("a", location);
			const b = HtmlElement.createElement("b", location);
			parent.insertBefore(a, null);
			parent.insertBefore(b, a);
			expect(parent.childElements).toHaveLength(2);
			expect(parent.childElements[0].tagName).toBe("b");
			expect(parent.childElements[0].parent?.tagName).toBe("parent");
			expect(parent.childElements[1].tagName).toBe("a");
			expect(parent.childElements[1].parent?.tagName).toBe("parent");
		});

		it("should handle null as reference", () => {
			expect.assertions(5);
			const parent = HtmlElement.createElement("parent", location);
			const a = HtmlElement.createElement("a", location);
			const b = HtmlElement.createElement("b", location);
			parent.insertBefore(a, null);
			parent.insertBefore(b, null);
			expect(parent.childElements).toHaveLength(2);
			expect(parent.childElements[0].tagName).toBe("a");
			expect(parent.childElements[0].parent?.tagName).toBe("parent");
			expect(parent.childElements[1].tagName).toBe("b");
			expect(parent.childElements[0].parent?.tagName).toBe("parent");
		});

		it("should handle missing reference", () => {
			expect.assertions(3);
			const parent = HtmlElement.createElement("parent", location);
			const a = HtmlElement.createElement("a", location);
			const b = HtmlElement.createElement("b", location);
			parent.insertBefore(b, a);
			expect(parent.childElements).toHaveLength(1);
			expect(parent.childElements[0].tagName).toBe("b");
			expect(parent.childElements[0].parent?.tagName).toBe("parent");
		});

		it("should change existing parent", () => {
			expect.assertions(4);
			const newParent = HtmlElement.createElement("new", location);
			const oldParent = HtmlElement.createElement("old", location);
			const element = HtmlElement.createElement("element", location);
			oldParent.insertBefore(element, null);
			newParent.insertBefore(element, null);
			expect(oldParent.childElements).toHaveLength(0);
			expect(newParent.childElements).toHaveLength(1);
			expect(newParent.childElements[0].tagName).toBe("element");
			expect(newParent.childElements[0].parent?.tagName).toBe("new");
		});
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

	describe("removeChild", () => {
		it("should remove child node", () => {
			expect.assertions(4);
			const root = HtmlElement.createElement("root", location);
			const element = HtmlElement.createElement("element", location, { parent: root });
			expect(root.childNodes).toHaveLength(1);
			expect(element.parent?.tagName).toBe("root");
			root.removeChild(element);
			expect(root.childNodes).toHaveLength(0);
			expect(element.parent).toBeNull();
		});

		it("should return removed child node", () => {
			expect.assertions(1);
			const root = HtmlElement.createElement("root", location);
			const element = HtmlElement.createElement("element", location);
			root.append(element);
			const removed = root.removeChild(element);
			expect(removed.isSameNode(element)).toBeTruthy();
		});

		it("should throw error if removing element which is not a child", () => {
			expect.assertions(1);
			const root = HtmlElement.createElement("root", location);
			const element = HtmlElement.createElement("element", location);
			expect(() => root.removeChild(element)).toThrow(
				"DOMException: _removeChild(..) could not find child to remove",
			);
		});
	});

	describe("textContent", () => {
		it("should get text from children", () => {
			expect.assertions(1);
			const root = HtmlElement.createElement("root", location);
			const a = HtmlElement.createElement("a", location, { parent: root });
			const b = HtmlElement.createElement("b", location, { parent: root });
			a.appendText("foo", location);
			b.appendText("bar", location);
			expect(root.textContent).toBe("foobar");
		});

		it("should get text from children (recursive)", () => {
			expect.assertions(1);
			const root = HtmlElement.createElement("root", location);
			const a = HtmlElement.createElement("a", location, { parent: root });
			const b = HtmlElement.createElement("b", location, { parent: root });
			const c = HtmlElement.createElement("b", location, { parent: b });
			a.appendText("foo", location);
			c.appendText("bar", location);
			expect(root.textContent).toBe("foobar");
		});

		it("should get text from children intermixed with text", () => {
			expect.assertions(1);
			const root = HtmlElement.createElement("root", location);
			const a = HtmlElement.createElement("a", location);
			const b = new TextNode(" bar ", location);
			const c = HtmlElement.createElement("c", location);
			a.appendText("foo", location);
			c.appendText("baz", location);
			root.append(a);
			root.append(b);
			root.append(c);
			expect(root.textContent).toBe("foo bar baz");
		});

		it("smoketest", async () => {
			expect.assertions(1);
			const markup = `lorem <i>ipsum</i> <b>dolor <u>sit amet</u></b>`;
			const resolvedConfig = await Config.empty().resolve();
			const parser = new Parser(resolvedConfig);
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
