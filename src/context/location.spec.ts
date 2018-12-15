import {Location, sliceLocation} from "./location";

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

});
