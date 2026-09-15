import { describe, expect, it } from "@jest/globals";
import { type Location } from "../location";
import { autofixCollectEdits } from "./autofix-collect-edits";
import { createAutofix } from "./create-autofix";
import { TextEditKind } from "./text-edit";

const location: Location = {
	filename: "test.html",
	offset: 0,
	line: 1,
	column: 1,
	size: 1,
};

function makeLocation(offset: number, size: number): Location {
	return { filename: "test.html", offset, line: 1, column: offset + 1, size };
}

describe("autofixCollectEdits()", () => {
	it("should collect no edits when fix does nothing", async () => {
		expect.assertions(1);
		const text = "lorem ipsum";
		const fix = createAutofix(text, () => {
			/* do nothing */
		});
		const edits = await autofixCollectEdits(fix);
		expect(edits).toEqual([]);
	});

	it("should collect a single edit", async () => {
		expect.assertions(1);
		const text = "lorem ipsum";
		const fix = createAutofix(text, (fixer) => {
			fixer.replaceText(location, "foo");
		});
		const edits = await autofixCollectEdits(fix);
		expect(edits).toEqual([
			{ kind: TextEditKind.Replace, location: { offset: 0, size: 1 }, replacement: "foo" },
		]);
	});

	it("should collect multiple edits sorted by descending offset", async () => {
		expect.assertions(1);
		const text = "lorem ipsum";
		const second: Location = { ...location, offset: 5 };
		const fix = createAutofix(text, (fixer) => {
			fixer.replaceText(location, "foo");
			fixer.replaceText(second, "bar");
		});
		const edits = await autofixCollectEdits(fix);
		expect(edits).toEqual([
			{ kind: TextEditKind.Replace, location: { offset: 5, size: 1 }, replacement: "bar" },
			{ kind: TextEditKind.Replace, location: { offset: 0, size: 1 }, replacement: "foo" },
		]);
	});

	it("should sort edits by descending offset regardless of call order", async () => {
		expect.assertions(1);
		const text = "lorem ipsum";
		const first: Location = { ...location, offset: 0 };
		const second: Location = { ...location, offset: 5 };
		const third: Location = { ...location, offset: 8 };
		const fix = createAutofix(text, (fixer) => {
			fixer.replaceText(third, "baz");
			fixer.replaceText(first, "foo");
			fixer.replaceText(second, "bar");
		});
		const edits = await autofixCollectEdits(fix);
		expect(edits).toEqual([
			{ kind: TextEditKind.Replace, location: { offset: 8, size: 1 }, replacement: "baz" },
			{ kind: TextEditKind.Replace, location: { offset: 5, size: 1 }, replacement: "bar" },
			{ kind: TextEditKind.Replace, location: { offset: 0, size: 1 }, replacement: "foo" },
		]);
	});

	it("should support asynchronous fix callbacks", async () => {
		expect.assertions(1);
		const text = "lorem ipsum";
		const fix = createAutofix(text, async (fixer) => {
			await Promise.resolve();
			fixer.replaceText(location, "foo");
		});
		const edits = await autofixCollectEdits(fix);
		expect(edits).toEqual([
			{ kind: TextEditKind.Replace, location: { offset: 0, size: 1 }, replacement: "foo" },
		]);
	});

	it("should use a fresh fixer for each invocation", async () => {
		expect.assertions(2);
		const text = "lorem ipsum";
		const fix = createAutofix(text, (fixer): void => {
			fixer.replaceText(location, "foo");
		});
		const first = await autofixCollectEdits(fix);
		const second = await autofixCollectEdits(fix);
		expect(first).toEqual([
			{ kind: TextEditKind.Replace, location: { offset: 0, size: 1 }, replacement: "foo" },
		]);
		expect(second).toEqual([
			{ kind: TextEditKind.Replace, location: { offset: 0, size: 1 }, replacement: "foo" },
		]);
	});

	it("should ignore the deprecated text parameter and use the bound source instead", async () => {
		expect.assertions(1);
		const text = "lorem ipsum";
		const fix = createAutofix(text, (fixer) => {
			fixer.replaceText(location, "foo");
		});
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- intentionally testing the deprecated overload */
		const edits = await autofixCollectEdits(fix, "some other unrelated text");
		expect(edits).toEqual([
			{ kind: TextEditKind.Replace, location: { offset: 0, size: 1 }, replacement: "foo" },
		]);
	});
});

describe("insertTextBefore()", () => {
	it("should insert at start of location", async () => {
		expect.assertions(1);
		const text = "lorem ipsum dolor sit amet";
		const location = makeLocation(text.indexOf("ipsum"), "ipsum".length);
		const fix = createAutofix(text, (fixer): void => {
			fixer.insertTextBefore(location, "before");
		});
		const result = await autofixCollectEdits(fix);
		expect(result).toEqual([
			{ kind: TextEditKind.Insert, location: { offset: 6, size: 0 }, insert: "before" },
		]);
	});
});

describe("insertTextAfter()", () => {
	it("should insert at end of location", async () => {
		expect.assertions(1);
		const text = "lorem ipsum dolor sit amet";
		const location = makeLocation(text.indexOf("ipsum"), "ipsum".length);
		const fix = createAutofix(text, (fixer): void => {
			fixer.insertTextAfter(location, "after");
		});
		const result = await autofixCollectEdits(fix);
		expect(result).toEqual([
			{ kind: TextEditKind.Insert, location: { offset: 11, size: 0 }, insert: "after" },
		]);
	});
});

describe("removeText()", () => {
	it("should collect removeText without options", async () => {
		expect.assertions(1);
		const text = "lorem ipsum";
		const loc: Location = {
			filename: "test.html",
			offset: text.indexOf("lorem"),
			line: 1,
			column: 1,
			size: "lorem".length,
		};
		const fix = createAutofix(text, (fixer) => {
			fixer.removeText(loc);
		});
		const edits = await autofixCollectEdits(fix);
		expect(edits).toEqual([
			{
				kind: TextEditKind.Remove,
				location: {
					offset: loc.offset,
					size: loc.size,
				},
			},
		]);
	});

	it("should expand the location to include adjacent whitespace", async () => {
		expect.assertions(1);
		const text = "lorem   ipsum dolor";
		const loc: Location = {
			filename: "test.html",
			offset: text.indexOf("ipsum"),
			line: 1,
			column: text.indexOf("ipsum") + 1,
			size: "ipsum".length,
		};
		const fix = createAutofix(text, (fixer) => {
			fixer.removeText(loc, { trimStart: true });
		});
		const edits = await autofixCollectEdits(fix);
		expect(edits).toEqual([
			{
				kind: TextEditKind.Remove,
				location: {
					offset: "lorem".length,
					size: "ipsum".length + 3 /* spaces */,
				},
			},
		]);
	});
});

describe("validation", () => {
	it("should throw when an edit is out of bounds", async () => {
		expect.assertions(1);
		const text = '<div foo="bar"></div>';
		const fix = createAutofix(text, (fixer) => {
			fixer.replaceText(makeLocation(100, 3), "lorem");
		});
		await expect(autofixCollectEdits(fix)).rejects.toThrow(/must be smaller than length/);
	});

	it("should throw when an edit has a negative offset", async () => {
		expect.assertions(1);
		const text = '<div foo="bar"></div>';
		const fix = createAutofix(text, (fixer) => {
			fixer.replaceText(makeLocation(-1, 3), "lorem");
		});
		await expect(autofixCollectEdits(fix)).rejects.toThrow(/positive integer/);
	});

	it("should detect overlapping edits regardless of kind", async () => {
		expect.assertions(1);
		const text = "lorem ipsum dolor sit amet";
		const fix = createAutofix(text, (fixer) => {
			fixer.removeText(makeLocation(0, 11));
			fixer.replaceText(makeLocation(5, 3), "x");
		});
		await expect(autofixCollectEdits(fix)).rejects.toThrow(/Overlapping edits/);
	});

	it("should throw when edits overlap", async () => {
		expect.assertions(1);
		const text = '<div foo="bar"></div>';
		const fix = createAutofix(text, (fixer) => {
			fixer.replaceText(makeLocation(5, 5), "a");
			fixer.replaceText(makeLocation(8, 3), "b");
		});
		await expect(autofixCollectEdits(fix)).rejects.toThrow(/Overlapping edits/);
	});

	it("should throw when two zero-size edits share the same offset", async () => {
		expect.assertions(1);
		const text = '<div foo="bar"></div>';
		const fix = createAutofix(text, (fixer) => {
			fixer.replaceText(makeLocation(5, 0), "a");
			fixer.replaceText(makeLocation(5, 0), "b");
		});
		await expect(autofixCollectEdits(fix)).rejects.toThrow(/Overlapping edits/);
	});

	it("should throw when a replacement and insertion share the same offset (replacement first)", async () => {
		expect.assertions(1);
		const text = '<div foo="bar"></div>';
		const fix = createAutofix(text, (fixer) => {
			fixer.replaceText(makeLocation(5, 3), "a");
			fixer.replaceText(makeLocation(5, 0), "b");
		});
		await expect(autofixCollectEdits(fix)).rejects.toThrow(/Overlapping edits/);
	});

	it("should throw when a replacement and insertion share the same offset (insertion first)", async () => {
		expect.assertions(1);
		const text = '<div foo="bar"></div>';
		const fix = createAutofix(text, (fixer) => {
			fixer.replaceText(makeLocation(5, 0), "a");
			fixer.replaceText(makeLocation(5, 3), "b");
		});
		await expect(autofixCollectEdits(fix)).rejects.toThrow(/Overlapping edits/);
	});

	it("should allow adjacent (non-overlapping, touching) edits", async () => {
		expect.assertions(1);
		const text = '<div foo="bar"></div>';
		const fix = createAutofix(text, (fixer) => {
			fixer.replaceText(makeLocation(5, 3), "a");
			fixer.replaceText(makeLocation(8, 1), "b");
		});
		const edits = await autofixCollectEdits(fix);
		expect(edits).toEqual([
			{ kind: TextEditKind.Replace, location: { offset: 8, size: 1 }, replacement: "b" },
			{ kind: TextEditKind.Replace, location: { offset: 5, size: 3 }, replacement: "a" },
		]);
	});
});
