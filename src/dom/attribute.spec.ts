import { Location } from "../context";
import { Attribute } from "./attribute";
import { DynamicValue } from "./dynamic-value";

const location: Location = {
	filename: "file",
	offset: 1,
	line: 1,
	column: 2,
};

describe("Attribute", () => {
	it("should set fields", () => {
		const attr = new Attribute("foo", "bar", location);
		expect(attr.key).toEqual("foo");
		expect(attr.value).toEqual("bar");
		expect(attr.location).toEqual(location);
	});

	it("should force value to null if passing undefined", () => {
		const a = new Attribute("foo", undefined, location);
		const b = new Attribute("foo", null, location);
		const c = new Attribute("foo", "", location);
		expect(a.value).toBeNull();
		expect(b.value).toBeNull();
		expect(c.value).toEqual("");
	});

	describe("valueMatches()", () => {
		it("should match string", () => {
			const attr = new Attribute("foo", "bar", location);
			expect(attr.valueMatches("bar")).toBeTruthy();
			expect(attr.valueMatches("ar")).toBeFalsy();
		});

		it("should match regexp", () => {
			const attr = new Attribute("foo", "bar", location);
			expect(attr.valueMatches(/bar/)).toBeTruthy();
			expect(attr.valueMatches(/ar$/)).toBeTruthy();
			expect(attr.valueMatches(/foo/)).toBeFalsy();
		});

		it("should match DynamicValue", () => {
			const attr = new Attribute("foo", new DynamicValue("bar"), location);
			expect(attr.valueMatches("foo")).toBeTruthy();
			expect(attr.valueMatches(/foo/)).toBeTruthy();
		});
	});
});
