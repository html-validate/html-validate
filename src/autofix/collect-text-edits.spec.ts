import { describe, expect, it } from "@jest/globals";
import { type ErrorFixer } from "../error-fixer";
import { type Location } from "../location";
import { collectTextEdits } from "./collect-text-edits";
import { TextEditKind } from "./text-edit";

const location: Location = {
	filename: "test.html",
	offset: 0,
	line: 1,
	column: 1,
	size: 1,
};

describe("collectTextEdits()", () => {
	it("should collect no edits when fix does nothing", async () => {
		expect.assertions(1);
		const text = "lorem ipsum";
		const edits = await collectTextEdits(() => {
			/* do nothing */
		}, text);
		expect(edits).toEqual([]);
	});

	it("should collect a single edit", async () => {
		expect.assertions(1);
		const text = "lorem ipsum";
		const edits = await collectTextEdits((fixer) => {
			fixer.replaceText(location, "foo");
		}, text);
		expect(edits).toEqual([{ kind: TextEditKind.Replace, location, replacement: "foo" }]);
	});

	it("should collect multiple edits in call order", async () => {
		expect.assertions(1);
		const text = "lorem ipsum";
		const second: Location = { ...location, offset: 5 };
		const edits = await collectTextEdits((fixer) => {
			fixer.replaceText(location, "foo");
			fixer.replaceText(second, "bar");
		}, text);
		expect(edits).toEqual([
			{ kind: TextEditKind.Replace, location, replacement: "foo" },
			{ kind: TextEditKind.Replace, location: second, replacement: "bar" },
		]);
	});

	it("should support asynchronous fix callbacks", async () => {
		expect.assertions(1);
		const text = "lorem ipsum";
		const edits = await collectTextEdits(async (fixer) => {
			await Promise.resolve();
			fixer.replaceText(location, "foo");
		}, text);
		expect(edits).toEqual([{ kind: TextEditKind.Replace, location, replacement: "foo" }]);
	});

	it("should use a fresh fixer for each invocation", async () => {
		expect.assertions(2);
		const text = "lorem ipsum";
		const fix = (fixer: ErrorFixer): void => {
			fixer.replaceText(location, "foo");
		};
		const first = await collectTextEdits(fix, text);
		const second = await collectTextEdits(fix, text);
		expect(first).toEqual([{ kind: TextEditKind.Replace, location, replacement: "foo" }]);
		expect(second).toEqual([{ kind: TextEditKind.Replace, location, replacement: "foo" }]);
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
		const edits = await collectTextEdits((fixer) => {
			fixer.removeText(loc);
		}, text);
		expect(edits).toEqual([
			{
				kind: TextEditKind.Remove,
				location: {
					filename: "test.html",
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
		const edits = await collectTextEdits((fixer) => {
			fixer.removeText(loc, { trimStart: true });
		}, text);
		expect(edits).toEqual([
			{
				kind: TextEditKind.Remove,
				location: {
					filename: "test.html",
					offset: "lorem".length,
					size: "ipsum".length + 3 /* spaces */,
				},
			},
		]);
	});
});
