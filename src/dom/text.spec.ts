import { NodeType } from "./nodetype";
import { TextNode } from "./text";

describe("TextNode", () => {
	it("should be a text node", () => {
		const node = new TextNode("lorem ipsum");
		expect(node.nodeType).toEqual(NodeType.TEXT_NODE);
		expect(node.nodeName).toEqual("#text");
		expect(node.isRootElement()).toBeFalsy();
	});

	it("textContent should return text", () => {
		const node = new TextNode("lorem ipsum");
		expect(node.textContent).toEqual("lorem ipsum");
	});
});
