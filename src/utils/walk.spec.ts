import { type Location } from "../context";
import { DOMTree, HtmlElement } from "../dom";
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
		const a = HtmlElement.createElement("a", location, { parent: root });
		const b = HtmlElement.createElement("b", location, { parent: root });
		const c = HtmlElement.createElement("c", location, { parent: b });
		const order: string[] = [];
		walk.depthFirst(root, (node) => order.push(node.tagName));
		expect(order).toEqual([a.tagName, c.tagName, b.tagName]);
	});

	it("should handle DOMTree instance", () => {
		expect.assertions(1);
		const tree = new DOMTree(location);
		const table = new MetaTable();
		const a = HtmlElement.createElement("a", location, { parent: tree.root });
		const b = HtmlElement.createElement("b", location, { parent: tree.root });
		const c = HtmlElement.createElement("c", location, { parent: b });
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
