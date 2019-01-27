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
		const attr = new Attribute("foo", "bar", keyLocation, valueLocation);
		expect(attr.key).toEqual("foo");
		expect(attr.value).toEqual("bar");
		expect(attr.keyLocation).toEqual(keyLocation);
		expect(attr.valueLocation).toEqual(valueLocation);
	});

	it("should force value to null if passing undefined", () => {
		const a = new Attribute("foo", undefined, keyLocation, null);
		const b = new Attribute("foo", null, keyLocation, null);
		const c = new Attribute("foo", "", keyLocation, valueLocation);
		expect(a.value).toBeNull();
		expect(b.value).toBeNull();
		expect(c.value).toEqual("");
	});

	describe("valueMatches()", () => {
		it("should match string", () => {
			const attr = new Attribute("foo", "bar", keyLocation, valueLocation);
			expect(attr.valueMatches("bar")).toBeTruthy();
			expect(attr.valueMatches("ar")).toBeFalsy();
		});

		it("should match regexp", () => {
			const attr = new Attribute("foo", "bar", keyLocation, valueLocation);
			expect(attr.valueMatches(/bar/)).toBeTruthy();
			expect(attr.valueMatches(/ar$/)).toBeTruthy();
			expect(attr.valueMatches(/foo/)).toBeFalsy();
		});

		it("should match DynamicValue", () => {
			const attr = new Attribute(
				"foo",
				new DynamicValue("bar"),
				keyLocation,
				valueLocation
			);
			expect(attr.valueMatches("foo")).toBeTruthy();
			expect(attr.valueMatches(/foo/)).toBeTruthy();
		});
	});
});
