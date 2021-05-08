import { Location } from "../context";
import { Attribute } from "./attribute";
import { DynamicValue } from "./dynamic-value";

const keyLocation: Location = {
	filename: "file",
	offset: 1,
	line: 1,
	column: 2,
	size: 3,
};

const valueLocation: Location = {
	filename: "file",
	offset: 6,
	line: 1,
	column: 7,
	size: 3,
};

describe("Attribute", () => {
	it("should set fields", () => {
		expect.assertions(4);
		const attr = new Attribute("foo", "bar", keyLocation, valueLocation);
		expect(attr.key).toEqual("foo");
		expect(attr.value).toEqual("bar");
		expect(attr.keyLocation).toEqual(keyLocation);
		expect(attr.valueLocation).toEqual(valueLocation);
	});

	it("should force value to null if passing undefined", () => {
		expect.assertions(3);
		/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
		/* @ts-ignore */
		const a = new Attribute("foo", undefined, keyLocation, null);
		const b = new Attribute("foo", null, keyLocation, null);
		const c = new Attribute("foo", "", keyLocation, valueLocation);
		expect(a.value).toBeNull();
		expect(b.value).toBeNull();
		expect(c.value).toEqual("");
	});

	describe("valueMatches()", () => {
		it("should match string", () => {
			expect.assertions(2);
			const attr = new Attribute("foo", "bar", keyLocation, valueLocation);
			expect(attr.valueMatches("bar")).toBeTruthy();
			expect(attr.valueMatches("ar")).toBeFalsy();
		});

		it("should match regexp", () => {
			expect.assertions(3);
			const attr = new Attribute("foo", "bar", keyLocation, valueLocation);
			expect(attr.valueMatches(/bar/)).toBeTruthy();
			expect(attr.valueMatches(/ar$/)).toBeTruthy();
			expect(attr.valueMatches(/foo/)).toBeFalsy();
		});

		it("should return false for boolean attributes", () => {
			expect.assertions(2);
			const attr = new Attribute("foo", null, keyLocation, valueLocation);
			expect(attr.valueMatches("true")).toBeFalsy();
			expect(attr.valueMatches(/any/)).toBeFalsy();
		});

		it("should match DynamicValue", () => {
			expect.assertions(2);
			const attr = new Attribute("foo", new DynamicValue("bar"), keyLocation, valueLocation);
			expect(attr.valueMatches("foo")).toBeTruthy();
			expect(attr.valueMatches(/foo/)).toBeTruthy();
		});

		it("should match ignore DynamicValue", () => {
			expect.assertions(2);
			const attr = new Attribute("foo", new DynamicValue("bar"), keyLocation, valueLocation);
			expect(attr.valueMatches("bar", false)).toBeFalsy();
			expect(attr.valueMatches(/bar/, false)).toBeFalsy();
		});
	});

	describe("flags", () => {
		let staticAttr: Attribute;
		let dynamicAttr: Attribute;

		beforeEach(() => {
			const dynamic = new DynamicValue("dynamic");
			staticAttr = new Attribute("foo", "static", keyLocation, valueLocation);
			dynamicAttr = new Attribute("bar", dynamic, keyLocation, valueLocation);
		});

		it("isStatic should be true for static attributes", () => {
			expect.assertions(2);
			expect(staticAttr.isStatic).toBeTruthy();
			expect(dynamicAttr.isStatic).toBeFalsy();
		});

		it("isDynamic should be true for dynamic attributes", () => {
			expect.assertions(2);
			expect(staticAttr.isDynamic).toBeFalsy();
			expect(dynamicAttr.isDynamic).toBeTruthy();
		});
	});
});
