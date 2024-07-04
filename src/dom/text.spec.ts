import { type Location } from "../context";
import { DOMNode } from "./domnode";
import { DynamicValue } from "./dynamic-value";
import { NodeType } from "./nodetype";
import { isTextNode, TextNode } from "./text";

const location: Location = {
	filename: "inline",
	line: 1,
	column: 1,
	offset: 0,
	size: 1,
};

describe("TextNode", () => {
	it("should be a text node", () => {
		expect.assertions(3);
		const node = new TextNode("lorem ipsum", location);
		expect(node.nodeType).toEqual(NodeType.TEXT_NODE);
		expect(node.nodeName).toBe("#text");
		expect(node.isRootElement()).toBeFalsy();
	});

	it("textContent should return text", () => {
		expect.assertions(1);
		const node = new TextNode("lorem ipsum", location);
		expect(node.textContent).toBe("lorem ipsum");
	});

	it("textContent should return expression from dynamic values", () => {
		expect.assertions(1);
		const node = new TextNode(new DynamicValue("{{ foo }}"), location);
		expect(node.textContent).toBe("{{ foo }}");
	});

	it("isStatic should return true for static text", () => {
		expect.assertions(2);
		const a = new TextNode("lorem ipsum", location);
		const b = new TextNode(new DynamicValue("{{ foo }}"), location);
		expect(a.isStatic).toBeTruthy();
		expect(b.isStatic).toBeFalsy();
	});

	it("isDynamic should return true for static text", () => {
		expect.assertions(2);
		const a = new TextNode("lorem ipsum", location);
		const b = new TextNode(new DynamicValue("{{ foo }}"), location);
		expect(a.isDynamic).toBeFalsy();
		expect(b.isDynamic).toBeTruthy();
	});
});

describe("isTextNode()", () => {
	it("should return true if node is a text node", () => {
		expect.assertions(1);
		const node = new TextNode("foobar", location);
		expect(isTextNode(node)).toBeTruthy();
	});
	it("should return false for other nodes", () => {
		expect.assertions(1);
		const node = new DOMNode(NodeType.DOCUMENT_NODE, "#document", location);
		expect(isTextNode(node)).toBeFalsy();
	});
	it("should handle null", () => {
		expect.assertions(1);
		expect(isTextNode(null)).toBeFalsy();
	});
	it("should handle undefined", () => {
		expect.assertions(1);
		expect(isTextNode(undefined)).toBeFalsy();
	});
});
