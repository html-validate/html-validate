import { type Location } from "../context";
import { DOMTokenList } from "./domtokenlist";
import { DynamicValue } from "./dynamic-value";

const location: Location = {
	filename: "mock",
	line: 1,
	column: 1,
	offset: 0,
	size: 11,
};

describe("DOMTokenList", () => {
	it("should split string into parts", () => {
		expect.assertions(1);
		const list = new DOMTokenList("foo bar baz", location);
		expect(Array.from(list)).toEqual(["foo", "bar", "baz"]);
	});

	it("should handle multiple spaces", () => {
		expect.assertions(1);
		const list = new DOMTokenList("foo  bar  baz", location);
		expect(Array.from(list)).toEqual(["foo", "bar", "baz"]);
	});

	it("should handle newlines", () => {
		expect.assertions(1);
		const list = new DOMTokenList("foo\nbar\r\nbaz", location);
		expect(Array.from(list)).toEqual(["foo", "bar", "baz"]);
	});

	it("should handle tabs", () => {
		expect.assertions(1);
		const list = new DOMTokenList("foo\tbar", location);
		expect(Array.from(list)).toEqual(["foo", "bar"]);
	});

	it("should handle leading and trailing spaces", () => {
		expect.assertions(1);
		const list = new DOMTokenList(" foo bar baz ", location);
		expect(Array.from(list)).toEqual(["foo", "bar", "baz"]);
	});

	it("should handle empty string", () => {
		expect.assertions(1);
		const list = new DOMTokenList("", location);
		expect(Array.from(list)).toEqual([]);
	});

	it("should handle null", () => {
		expect.assertions(1);
		const list = new DOMTokenList(null, null);
		expect(Array.from(list)).toEqual([]);
	});

	it("should handle DynamicValue", () => {
		expect.assertions(1);
		const dynamic = new DynamicValue("foo");
		const list = new DOMTokenList(dynamic, location);
		expect(Array.from(list)).toEqual([]);
	});

	it(".value should return original value", () => {
		expect.assertions(1);
		const list = new DOMTokenList("foo bar baz", location);
		expect(list.value).toBe("foo bar baz");
	});

	it(".value should return expression", () => {
		expect.assertions(1);
		const dynamic = new DynamicValue("foo");
		const list = new DOMTokenList(dynamic, location);
		expect(list.value).toBe("foo");
	});

	describe("item()", () => {
		it("should return item by index", () => {
			expect.assertions(1);
			const list = new DOMTokenList("foo bar baz", location);
			expect(list.item(1)).toBe("bar");
		});

		it("should return undefined if out of range", () => {
			expect.assertions(2);
			const list = new DOMTokenList("foo bar baz", location);
			expect(list.item(-1)).toBeUndefined();
			expect(list.item(3)).toBeUndefined();
		});
	});

	describe("location()", () => {
		it("should return location by index", () => {
			expect.assertions(3);
			const list = new DOMTokenList("foo bar  baz", location);
			expect(list.location(0)).toEqual({
				filename: "mock",
				line: 1,
				column: 1,
				offset: 0,
				size: 3,
			});
			expect(list.location(1)).toEqual({
				filename: "mock",
				line: 1,
				column: 5,
				offset: 4,
				size: 3,
			});
			expect(list.location(2)).toEqual({
				filename: "mock",
				line: 1,
				column: 10,
				offset: 9,
				size: 3,
			});
		});

		it("should return undefined if out of range", () => {
			expect.assertions(2);
			const list = new DOMTokenList("foo bar baz", location);
			expect(list.location(-1)).toBeUndefined();
			expect(list.location(3)).toBeUndefined();
		});

		it("should throw error when accessing location without base location", () => {
			expect.assertions(1);
			const list = new DOMTokenList("foo", null);
			expect(() => list.location(0)).toThrow();
		});
	});

	describe("contains()", () => {
		it("should return true if token exists", () => {
			expect.assertions(1);
			const list = new DOMTokenList("foo bar baz", location);
			expect(list.contains("baz")).toBeTruthy();
		});

		it("should return false if token doesn't exists", () => {
			expect.assertions(1);
			const list = new DOMTokenList("foo bar baz", location);
			expect(list.contains("spam")).toBeFalsy();
		});
	});

	describe("iterator()", () => {
		it("should loop over all items and locations", () => {
			expect.assertions(1);
			const list = new DOMTokenList("foo bar baz", location);
			const result = Array.from(list.iterator());
			expect(result).toEqual([
				{
					index: 0,
					item: "foo",
					location: expect.objectContaining({ line: 1, column: 1, size: 3 }),
				},
				{
					index: 1,
					item: "bar",
					location: expect.objectContaining({ line: 1, column: 5, size: 3 }),
				},
				{
					index: 2,
					item: "baz",
					location: expect.objectContaining({ line: 1, column: 9, size: 3 }),
				},
			]);
		});
	});
});
