import { describe, expect, it } from "@jest/globals";
import { type Location } from "../location";
import { applyTextEdits } from "./apply-text-edits";
import { autofixCollectEdits } from "./autofix-collect-edits";
import { createAutofix } from "./create-autofix";

function location(offset: number, size: number): Location {
	return { filename: "test.html", offset, line: 1, column: offset + 1, size };
}

describe("insertTextBefore()", () => {
	it("should insert text at start of location", async () => {
		expect.assertions(1);
		const text = "lorem ipsum dolor sit amet";
		const offset = text.indexOf("ipsum");
		const size = "ipsum".length;
		const fix = createAutofix(text, (fixer): void => {
			fixer.insertTextBefore(location(offset, size), "before");
		});
		const edits = await autofixCollectEdits(fix);
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
		const fix = createAutofix(text, (fixer): void => {
			fixer.insertTextAfter(location(offset, size), "after");
		});
		const edits = await autofixCollectEdits(fix);
		const result = applyTextEdits(text, edits);
		expect(result).toBe("lorem ipsumafter dolor sit amet");
	});
});
