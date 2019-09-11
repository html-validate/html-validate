import { Location, sliceLocation } from "./location";

describe("sliceLocation()", () => {
	let location: Location;

	beforeEach(() => {
		location = {
			filename: "-",
			offset: 0,
			line: 1,
			column: 1,
			size: 10,
		};
	});

	it("should handle falsy values", () => {
		expect(sliceLocation(undefined, 1)).toBeNull();
		expect(sliceLocation(null, 1)).toBeNull();
	});

	it("should slice off beginning", () => {
		expect(sliceLocation(location, 1)).toEqual({
			filename: "-",
			offset: 1,
			line: 1,
			column: 2,
			size: 9,
		});
	});

	it("should slice off end", () => {
		expect(sliceLocation(location, 0, 9)).toEqual({
			filename: "-",
			offset: 0,
			line: 1,
			column: 1,
			size: 9,
		});
	});

	it("should slice off end using negative index", () => {
		expect(sliceLocation(location, 0, -2)).toEqual({
			filename: "-",
			offset: 0,
			line: 1,
			column: 1,
			size: 8,
		});
	});

	it("should slice off both ends", () => {
		expect(sliceLocation(location, 1, 9)).toEqual({
			filename: "-",
			offset: 1,
			line: 1,
			column: 2,
			size: 8,
		});
	});

	it("should handle missing size", () => {
		(location as any).size = null;
		expect(sliceLocation(location, 1)).toEqual({
			filename: "-",
			offset: 1,
			line: 1,
			column: 2,
			size: null,
		});
	});

	it("should wrap line/column when newlines are present", () => {
		const text = "foo\nbar baz\nspam";
		(location as any).size = text.length;
		expect(sliceLocation(location, 8, 11, text)).toEqual({
			filename: "-",
			offset: 8,
			line: 2,
			column: 5,
			size: 3,
		});
		expect(sliceLocation(location, 12, 16, text)).toEqual({
			filename: "-",
			offset: 12,
			line: 3,
			column: 1,
			size: 4,
		});
	});
});
