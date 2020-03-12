import { MetaTable } from "../meta";
import { DOMTree } from "./domtree";
import { HtmlElement } from "./htmlelement";

describe("DOMTree", () => {
	let tree: DOMTree;
	let node: HtmlElement;

	beforeAll(() => {
		tree = new DOMTree(null);
		node = new HtmlElement("foo");
		tree.root.append(node);
	});

	it("should keep track of active element", () => {
		expect.assertions(3);
		expect(tree.getActive().unique).toEqual(tree.root.unique);
		tree.pushActive(node);
		expect(tree.getActive().unique).toEqual(node.unique);
		tree.popActive();
		expect(tree.getActive().unique).toEqual(tree.root.unique);
	});

	it("should handle out-of-order pops", () => {
		expect.assertions(2);
		expect(tree.getActive().unique).toEqual(tree.root.unique);
		tree.popActive();
		expect(tree.getActive().unique).toEqual(tree.root.unique);
	});

	it("resolveMeta() should resolve meta on all nodes", () => {
		expect.assertions(1);
		const table = new MetaTable();
		const spy = jest.spyOn(table, "resolve");
		tree.resolveMeta(table);
		expect(spy).toHaveBeenCalledWith(node);
	});

	it("getElementsByTagName() should delegate call to root element", () => {
		expect.assertions(2);
		const expected = [node];
		const spy = jest
			.spyOn(tree.root, "getElementsByTagName")
			.mockReturnValue(expected);
		const tagName = "foo";
		expect(tree.getElementsByTagName(tagName)).toBe(expected);
		expect(spy).toHaveBeenCalledWith(tagName);
	});

	it("visitDepthFirst() should delegate call to root element", () => {
		expect.assertions(1);
		const spy = jest.spyOn(tree.root, "visitDepthFirst");
		const cb = jest.fn();
		tree.visitDepthFirst(cb);
		expect(spy).toHaveBeenCalledWith(cb);
	});

	it("find() should delegate call to root element", () => {
		expect.assertions(2);
		const spy = jest.spyOn(tree.root, "find").mockReturnValue(node);
		const cb = jest.fn().mockReturnValue(true);
		expect(tree.find(cb)).toBe(node);
		expect(spy).toHaveBeenCalledWith(cb);
	});

	it("querySelector() should delegate call to root element", () => {
		expect.assertions(2);
		const spy = jest.spyOn(tree.root, "querySelector").mockReturnValue(node);
		const selector = "foo";
		expect(tree.querySelector(selector)).toBe(node);
		expect(spy).toHaveBeenCalledWith(selector);
	});

	it("querySelectorAll() should delegate call to root element", () => {
		expect.assertions(2);
		const expected = [node];
		const spy = jest
			.spyOn(tree.root, "querySelectorAll")
			.mockReturnValue(expected);
		const selector = "foo";
		expect(tree.querySelectorAll(selector)).toBe(expected);
		expect(spy).toHaveBeenCalledWith(selector);
	});
});
