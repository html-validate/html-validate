import { type Location } from "../context";
import { DOMTree, HtmlElement, NodeClosed } from "../dom";
import { MetaTable } from "../meta";
import { walk } from "./walk";

const location: Location = {
	filename: "mock",
	offset: 0,
	line: 1,
	column: 1,
	size: 4,
};

describe("walk.depthFirst()", () => {
	it("should visit all nodes in correct order", () => {
		expect.assertions(1);
		const root = HtmlElement.rootNode(location);
		const a = new HtmlElement("a", root, NodeClosed.EndTag, null, location);
		const b = new HtmlElement("b", root, NodeClosed.EndTag, null, location);
		const c = new HtmlElement("c", b, NodeClosed.EndTag, null, location);
		const order: string[] = [];
		walk.depthFirst(root, (node) => order.push(node.tagName));
		expect(order).toEqual([a.tagName, c.tagName, b.tagName]);
	});

	it("should handle DOMTree instance", () => {
		expect.assertions(1);
		const tree = new DOMTree(location);
		const table = new MetaTable();
		const a = new HtmlElement("a", tree.root, NodeClosed.EndTag, null, location);
		const b = new HtmlElement("b", tree.root, NodeClosed.EndTag, null, location);
		const c = new HtmlElement("c", b, NodeClosed.EndTag, null, location);
		tree.resolveMeta(table);
		const order: string[] = [];
		walk.depthFirst(tree, (node) => order.push(node.tagName));
		expect(order).toEqual([a.tagName, c.tagName, b.tagName]);
	});

	it("should throw error if DOMTree isn't ready", () => {
		expect.assertions(1);
		const tree = new DOMTree(location);
		expect(() => {
			walk.depthFirst(tree, () => {
				/* do nothing */
			});
		}).toThrow(`Cannot call walk.depthFirst(..) before document is ready`);
	});
});
