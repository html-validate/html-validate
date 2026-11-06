import { expect, it, jest } from "@jest/globals";
import { HtmlElement } from "../../dom";
import { type Location } from "../../location";
import { MetaTable } from "../../meta";
import { isForeign } from "./is-foreign";

const location: Location = {
	filename: "inline",
	line: 1,
	column: 1,
	offset: 0,
	size: 1,
};

const table = new MetaTable();
table.loadFromObject({ foreign: { foreign: true } });
table.init();

it("should detect a foreign element and its descendants", () => {
	expect.assertions(3);
	const foreign = HtmlElement.createElement("foreign", location, {
		meta: table.getMetaFor("foreign"),
	});
	const child = HtmlElement.createElement("child", location, { parent: foreign });
	const grandchild = HtmlElement.createElement("grandchild", location, { parent: child });
	expect(isForeign(foreign)).toBe(true);
	expect(isForeign(child)).toBe(true);
	expect(isForeign(grandchild)).toBe(true);
});

it("should return false without a foreign ancestor", () => {
	expect.assertions(1);
	const parent = HtmlElement.createElement("parent", location);
	const child = HtmlElement.createElement("child", location, { parent });
	expect(isForeign(child)).toBe(false);
});

it.each([true, false])("should cache a %s result on the element", (foreign) => {
	expect.assertions(3);
	const node = HtmlElement.createElement("element", location, {
		meta: foreign ? table.getMetaFor("foreign") : null,
	});
	node.cacheEnable();
	const meta = jest.spyOn(node, "meta", "get");
	expect(isForeign(node)).toBe(foreign);
	expect(isForeign(node)).toBe(foreign);
	expect(meta).toHaveBeenCalledTimes(1);
});

it.each([true, false])("should reuse a cached %s ancestor result", (foreign) => {
	expect.assertions(3);
	const parent = HtmlElement.createElement("parent", location, {
		meta: foreign ? table.getMetaFor("foreign") : null,
	});
	const child = HtmlElement.createElement("child", location, { parent });
	parent.cacheEnable();
	child.cacheEnable();
	const meta = jest.spyOn(parent, "meta", "get");
	expect(isForeign(parent)).toBe(foreign);
	expect(isForeign(child)).toBe(foreign);
	expect(meta).toHaveBeenCalledTimes(1);
});

it.each([true, false])("should cache each visited ancestor for a %s result", (foreign) => {
	expect.assertions(5);
	const ancestor = HtmlElement.createElement("ancestor", location, {
		meta: foreign ? table.getMetaFor("foreign") : null,
	});
	const parent = HtmlElement.createElement("parent", location, { parent: ancestor });
	const child = HtmlElement.createElement("child", location, { parent });
	const sibling = HtmlElement.createElement("sibling", location, { parent });
	ancestor.cacheEnable();
	parent.cacheEnable();
	child.cacheEnable();
	sibling.cacheEnable();
	const parentMeta = jest.spyOn(parent, "meta", "get");
	const ancestorMeta = jest.spyOn(ancestor, "meta", "get");
	expect(isForeign(child)).toBe(foreign);
	expect(isForeign(sibling)).toBe(foreign);
	expect(isForeign(parent)).toBe(foreign);
	expect(parentMeta).toHaveBeenCalledTimes(1);
	expect(ancestorMeta).toHaveBeenCalledTimes(1);
});
