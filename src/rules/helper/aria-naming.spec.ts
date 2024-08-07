import { type Location } from "../../context";
import { DynamicValue, HtmlElement } from "../../dom";
import { MetaTable } from "../../meta";
import { ariaNaming } from "./aria-naming";

const mockLocation: Location = {
	filename: "mock-filename.html",
	line: 1,
	column: 1,
	offset: 0,
	size: 1,
};

const table = new MetaTable();
table.loadFromObject({
	allowed: {
		aria: {
			naming() {
				return "allowed";
			},
		},
	},
	prohibited: {
		aria: {
			naming() {
				return "prohibited";
			},
		},
	},
});
table.init();

it("should return allowed if element allows naming", () => {
	expect.assertions(1);
	const meta = table.getMetaFor("allowed");
	const element = HtmlElement.createElement("allowed", mockLocation, { meta });
	expect(ariaNaming(element)).toBe("allowed");
});

it("should return prohibited if element does not allow naming", () => {
	expect.assertions(1);
	const meta = table.getMetaFor("prohibited");
	const element = HtmlElement.createElement("prohibited", mockLocation, { meta });
	expect(ariaNaming(element)).toBe("prohibited");
});

it("should return allowed if element does not have metadata", () => {
	expect.assertions(1);
	const meta = table.getMetaFor("missing");
	const element = HtmlElement.createElement("missing", mockLocation, { meta });
	expect(ariaNaming(element)).toBe("allowed");
});

it("should cache result", () => {
	expect.assertions(3);
	const meta = table.getMetaFor("allowed")!;
	const spy = jest.spyOn(meta.aria, "naming");
	const element = HtmlElement.createElement("allowed", mockLocation, { meta });
	element.cacheEnable();
	expect(spy).toHaveBeenCalledTimes(0);
	ariaNaming(element);
	expect(spy).toHaveBeenCalledTimes(1);
	ariaNaming(element);
	expect(spy).toHaveBeenCalledTimes(1);
});

it("should return allowed if element with role allows naming", () => {
	expect.assertions(1);
	const meta = table.getMetaFor("allowed");
	const element = HtmlElement.createElement("allowed", mockLocation, { meta });
	element.setAttribute("role", "button", mockLocation, mockLocation);
	expect(ariaNaming(element)).toBe("allowed");
});

it("should return prohibited if element with role does not allow naming", () => {
	expect.assertions(1);
	const meta = table.getMetaFor("allowed");
	const element = HtmlElement.createElement("allowed", mockLocation, { meta });
	element.setAttribute("role", "generic", mockLocation, mockLocation);
	expect(ariaNaming(element)).toBe("prohibited");
});

it("should return allowed if element have dynamic role", () => {
	expect.assertions(1);
	const meta = table.getMetaFor("allowed");
	const element = HtmlElement.createElement("allowed", mockLocation, { meta });
	element.setAttribute("role", new DynamicValue("expr"), mockLocation, mockLocation);
	expect(ariaNaming(element)).toBe("allowed");
});
