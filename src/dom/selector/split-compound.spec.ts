import { splitCompound } from "./split-compound";

describe("splitCompound()", () => {
	it("should return [] when and empty string is passed", () => {
		expect.assertions(1);
		expect(Array.from(splitCompound(""))).toEqual([]);
	});

	it("should return the full string when no delimiter was found", () => {
		expect.assertions(1);
		expect(Array.from(splitCompound("div"))).toEqual(["div"]);
	});

	it("should split class selector", () => {
		expect.assertions(1);
		expect(Array.from(splitCompound("div.foo"))).toEqual(["div", ".foo"]);
	});

	it("should split id selector", () => {
		expect.assertions(1);
		expect(Array.from(splitCompound("div#foo"))).toEqual(["div", "#foo"]);
	});

	it("should split attribute selector", () => {
		expect.assertions(1);
		expect(Array.from(splitCompound("div[foo=bar]"))).toEqual(["div", "[foo=bar]"]);
	});

	it("should split pseudo class selector", () => {
		expect.assertions(1);
		expect(Array.from(splitCompound("div:foo"))).toEqual(["div", ":foo"]);
	});

	it("should split pseudo element selector", () => {
		expect.assertions(1);
		expect(Array.from(splitCompound("div::foo"))).toEqual(["div", "::foo"]);
	});

	it("should handle leading class selector", () => {
		expect.assertions(1);
		expect(Array.from(splitCompound(".foo"))).toEqual([".foo"]);
	});

	it("should handle leading id selector", () => {
		expect.assertions(1);
		expect(Array.from(splitCompound("#foo"))).toEqual(["#foo"]);
	});

	it("should handle leading attribute selector", () => {
		expect.assertions(1);
		expect(Array.from(splitCompound("[foo=bar]"))).toEqual(["[foo=bar]"]);
	});

	it("should handle leading pseudo class selector", () => {
		expect.assertions(1);
		expect(Array.from(splitCompound(":foo"))).toEqual([":foo"]);
	});

	it("should handle leading pseudo element selector", () => {
		expect.assertions(1);
		expect(Array.from(splitCompound("::foo"))).toEqual(["::foo"]);
	});

	it("should handle nested characters in string", () => {
		expect.assertions(1);
		expect(Array.from(splitCompound('[id=":#[]\'"'))).toEqual(['[id=":#[]\'"']);
	});
});
