import { DOMTokenList } from "./domtokenlist";

describe("DOMTokenList", () => {

	it("should split string into parts", () => {
		const list = new DOMTokenList("foo bar baz");
		expect(Array.from(list)).toEqual(["foo", "bar", "baz"]);
	});

	it("should handle multiple spaces", () => {
		const list = new DOMTokenList("foo  bar  baz");
		expect(Array.from(list)).toEqual(["foo", "bar", "baz"]);
	});

	it("should handle leading and trailing spaces", () => {
		const list = new DOMTokenList(" foo bar baz ");
		expect(Array.from(list)).toEqual(["foo", "bar", "baz"]);
	});

	it("should handle empty string", () => {
		const list = new DOMTokenList("");
		expect(Array.from(list)).toEqual([]);
	});

	it("should handle null", () => {
		const list = new DOMTokenList(null);
		expect(Array.from(list)).toEqual([]);
	});

	it(".value should return original value", () => {
		const list = new DOMTokenList("foo bar baz");
		expect(list.value).toEqual("foo bar baz");
	});

	describe("item()", () => {

		it("should return item by index", () => {
			const list = new DOMTokenList("foo bar baz");
			expect(list.item(1)).toEqual("bar");
		});

		it("should return undefined if out of range", () => {
			const list = new DOMTokenList("foo bar baz");
			expect(list.item(-1)).toBeUndefined();
			expect(list.item(3)).toBeUndefined();
		});

	});

	describe("contains()", () => {

		it("should return true if token exists", () => {
			const list = new DOMTokenList("foo bar baz");
			expect(list.contains("baz")).toBeTruthy();
		});

		it("should return false if token doesn't exists", () => {
			const list = new DOMTokenList("foo bar baz");
			expect(list.contains("spam")).toBeFalsy();
		});

	});

});
