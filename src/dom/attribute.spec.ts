import { Location } from "../context";
import { Attribute } from "./attribute";

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
});
