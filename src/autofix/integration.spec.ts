import { describe, expect, it } from "@jest/globals";
import { type ErrorFixer } from "../error-fixer";
import { type Location } from "../location";
import { applyTextEdits } from "./apply-text-edits";
import { autofixCollectEdits } from "./autofix-collect-edits";

function location(offset: number, size: number): Location {
	return { filename: "test.html", offset, line: 1, column: offset + 1, size };
}

describe("insertTextBefore()", () => {
	it("should insert text at start of location", async () => {
		expect.assertions(1);
		const text = "lorem ipsum dolor sit amet";
		const offset = text.indexOf("ipsum");
		const size = "ipsum".length;
		const fix = (fixer: ErrorFixer): void => {
			fixer.insertTextBefore(location(offset, size), "before");
		};
		const edits = await autofixCollectEdits(fix, text);
		const result = applyTextEdits(text, edits);
		expect(result).toBe("lorem beforeipsum dolor sit amet");
	});
});

describe("insertTextAfter()", () => {
	it("should insert text at end of location", async () => {
		expect.assertions(1);
		const text = "lorem ipsum dolor sit amet";
		const offset = text.indexOf("ipsum");
		const size = "ipsum".length;
		const fix = (fixer: ErrorFixer): void => {
			fixer.insertTextAfter(location(offset, size), "after");
		};
		const edits = await autofixCollectEdits(fix, text);
		const result = applyTextEdits(text, edits);
		expect(result).toBe("lorem ipsumafter dolor sit amet");
	});
});
