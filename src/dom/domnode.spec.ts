import { DOMNode, NodeType } from "./domnode";

describe("DOMNode", () => {
	it("should set nodeName and nodeType", () => {
		const node = new DOMNode("foo");
		expect(node.nodeName).toEqual("foo");
		expect(node.nodeType).toEqual(NodeType.ELEMENT_NODE);
	});

	it("should be assigned a unique id", () => {
		const n1 = new DOMNode("foo");
		const n2 = new DOMNode("foo");
		expect(n1.unique).toEqual(expect.any(Number));
		expect(n2.unique).toEqual(expect.any(Number));
		expect(n1.unique === n2.unique).toBeFalsy();
	});

	it("root element", () => {
		const node = new DOMNode(null);
		expect(node.nodeName).toEqual("#document");
		expect(node.nodeType).toEqual(NodeType.DOCUMENT_NODE);
	});

	it("append() should add node as child", () => {
		const parent = new DOMNode("parent");
		const child = new DOMNode("child");
		expect(parent.childNodes).toHaveLength(0);
		parent.append(child);
		expect(parent.childNodes).toHaveLength(1);
		expect(parent.childNodes[0].unique).toEqual(child.unique);
	});

	describe("isRootElement()", () => {
		it("should return true for root element", () => {
			const node = new DOMNode(null);
			expect(node.isRootElement()).toBeTruthy();
		});
		it("should false true for other element", () => {
			const node = new DOMNode("foo");
			expect(node.isRootElement()).toBeFalsy();
		});
	});

	describe("disabled rules", () => {
		it("rules should default to enabled", () => {
			const node = new DOMNode("foo");
			expect(node.ruleEnabled("my-rule")).toBeTruthy();
		});

		it("disableRule() should disable rule", () => {
			const node = new DOMNode("foo");
			node.disableRule("my-rule");
			expect(node.ruleEnabled("my-rule")).toBeFalsy();
		});

		it("enableRule() should enable rule", () => {
			const node = new DOMNode("foo");
			node.disableRule("my-rule");
			expect(node.ruleEnabled("my-rule")).toBeFalsy();
			node.enableRule("my-rule");
			expect(node.ruleEnabled("my-rule")).toBeTruthy();
		});
	});
});
