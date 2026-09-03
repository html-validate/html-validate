import { describe, expect, it } from "@jest/globals";
import { applyTextEdits } from "./apply-text-edits";
import { type TextEditRemove, type TextEditReplace, TextEditKind } from "./text-edit";

function loc(offset: number, size: number): { offset: number; size: number } {
	return { offset, size };
}

function replaceText(location: TextEditReplace["location"], replacement: string): TextEditReplace {
	return { kind: TextEditKind.Replace, location, replacement };
}

function removeText(location: TextEditRemove["location"]): TextEditRemove {
	return { kind: TextEditKind.Remove, location };
}

describe("applyTextEdits()", () => {
	it("should return source unchanged when there are no edits", () => {
		expect.assertions(1);
		const text = '<div foo="bar"></div>';
		expect(applyTextEdits(text, [])).toBe(text);
	});
});

describe("replaceText()", () => {
	it("should replace a single edit", () => {
		expect.assertions(1);
		const text = '<div foo="bar"></div>';
		const result = applyTextEdits(text, [replaceText(loc(5, 3), "lorem")]);
		expect(result).toBe('<div lorem="bar"></div>');
	});

	it("should apply multiple edits given in descending offset order", () => {
		expect.assertions(1);
		const text = '<div foo="bar"></div>';
		const keyLocation = loc(5, 3);
		const valueLocation = loc(10, 3);
		const result = applyTextEdits(text, [
			replaceText(valueLocation, "ipsum"),
			replaceText(keyLocation, "lorem"),
		]);
		expect(result).toBe('<div lorem="ipsum"></div>');
	});

	it("should support replacements with different length than the original text", () => {
		expect.assertions(1);
		const text = '<div foo="bar"></div>';
		const result = applyTextEdits(text, [replaceText(loc(10, 3), "a much longer value")]);
		expect(result).toBe('<div foo="a much longer value"></div>');
	});
});

describe("removeText()", () => {
	it("should remove text", () => {
		expect.assertions(1);
		const text = "lorem ipsum dolor sit amet";
		const location = loc(text.indexOf("ipsum"), "ipsum".length);
		const result = applyTextEdits(text, [removeText(location)]);
		expect(result).toBe("lorem  dolor sit amet");
	});
});
