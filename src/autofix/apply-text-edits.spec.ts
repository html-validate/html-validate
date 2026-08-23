import { describe, expect, it } from "@jest/globals";
import { type Location } from "../location";
import { applyTextEdits } from "./apply-text-edits";
import { type TextEditReplace, TextEditKind } from "./text-edit";

function loc(offset: number, size: number, filename = "test.html"): Location {
	return { filename, offset, line: 1, column: offset + 1, size };
}

function replace(location: Location, replacement: string): TextEditReplace {
	return { kind: TextEditKind.Replace, location, replacement };
}

describe("applyTextEdits()", () => {
	it("should return source unchanged when there are no edits", () => {
		expect.assertions(1);
		const source = '<div foo="bar"></div>';
		expect(applyTextEdits("test.html", source, [])).toBe(source);
	});

	it("should replace a single edit", () => {
		expect.assertions(1);
		const source = '<div foo="bar"></div>';
		const result = applyTextEdits("test.html", source, [replace(loc(5, 3), "lorem")]);
		expect(result).toBe('<div lorem="bar"></div>');
	});

	it("should replace attribute key and value using original locations", () => {
		expect.assertions(1);
		const source = '<div foo="bar"></div>';
		const keyLocation = loc(5, 3);
		const valueLocation = loc(10, 3);
		const result = applyTextEdits("test.html", source, [
			replace(keyLocation, "lorem"),
			replace(valueLocation, "ipsum"),
		]);
		expect(result).toBe('<div lorem="ipsum"></div>');
	});

	it("should produce the same result regardless of input order", () => {
		expect.assertions(1);
		const source = '<div foo="bar"></div>';
		const keyLocation = loc(5, 3);
		const valueLocation = loc(10, 3);
		const result = applyTextEdits("test.html", source, [
			replace(valueLocation, "ipsum"),
			replace(keyLocation, "lorem"),
		]);
		expect(result).toBe('<div lorem="ipsum"></div>');
	});

	it("should support replacements with different length than the original text", () => {
		expect.assertions(1);
		const source = '<div foo="bar"></div>';
		const result = applyTextEdits("test.html", source, [
			replace(loc(10, 3), "a much longer value"),
		]);
		expect(result).toBe('<div foo="a much longer value"></div>');
	});

	it("should throw when an edit targets a different filename", () => {
		expect.assertions(1);
		const source = '<div foo="bar"></div>';
		expect(() => {
			applyTextEdits("test.html", source, [replace(loc(5, 3, "other.html"), "lorem")]);
		}).toThrow(/other\.html/);
	});

	it("should throw when an edit is out of bounds", () => {
		expect.assertions(1);
		const source = '<div foo="bar"></div>';
		expect(() => {
			applyTextEdits("test.html", source, [replace(loc(100, 3), "lorem")]);
		}).toThrow(/out of bounds/);
	});

	it("should throw when an edit has a negative offset", () => {
		expect.assertions(1);
		const source = '<div foo="bar"></div>';
		expect(() => {
			applyTextEdits("test.html", source, [replace(loc(-1, 3), "lorem")]);
		}).toThrow(/out of bounds/);
	});

	it("should throw when edits overlap", () => {
		expect.assertions(1);
		const source = '<div foo="bar"></div>';
		expect(() => {
			applyTextEdits("test.html", source, [replace(loc(5, 5), "a"), replace(loc(8, 3), "b")]);
		}).toThrow(/Overlapping edits/);
	});

	it("should throw when two zero-size edits share the same offset", () => {
		expect.assertions(1);
		const source = '<div foo="bar"></div>';
		expect(() => {
			applyTextEdits("test.html", source, [replace(loc(5, 0), "a"), replace(loc(5, 0), "b")]);
		}).toThrow(/Overlapping edits/);
	});

	it("should throw when a replacement and insertion share the same offset (replacement first)", () => {
		expect.assertions(1);
		const source = '<div foo="bar"></div>';
		expect(() => {
			applyTextEdits("test.html", source, [replace(loc(5, 3), "a"), replace(loc(5, 0), "b")]);
		}).toThrow(/Overlapping edits/);
	});

	it("should throw when a replacement and insertion share the same offset (insertion first)", () => {
		expect.assertions(1);
		const source = '<div foo="bar"></div>';
		expect(() => {
			applyTextEdits("test.html", source, [replace(loc(5, 0), "a"), replace(loc(5, 3), "b")]);
		}).toThrow(/Overlapping edits/);
	});

	it("should allow adjacent (non-overlapping, touching) edits", () => {
		expect.assertions(1);
		const source = '<div foo="bar"></div>';
		const result = applyTextEdits("test.html", source, [
			replace(loc(5, 3), "a"),
			replace(loc(8, 1), "b"),
		]);
		expect(result).toBe('<div ab"bar"></div>');
	});
});
