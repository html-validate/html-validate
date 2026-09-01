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
