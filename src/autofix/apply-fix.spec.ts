import { describe, expect, it } from "@jest/globals";
import { type Location } from "../location";
import { applyFix } from "./apply-fix";

function loc(offset: number, size: number, filename = "test.html"): Location {
	return { filename, offset, line: 1, column: offset + 1, size };
}

describe("applyFix()", () => {
	it("should collect and apply edits from a fix callback", async () => {
		expect.assertions(1);
		const source = '<div foo="bar"></div>';
		const result = await applyFix("test.html", source, (fixer) => {
			fixer.replaceText(loc(5, 3), "lorem");
			fixer.replaceText(loc(10, 3), "ipsum");
		});
		expect(result).toBe('<div lorem="ipsum"></div>');
	});

	it("should return source unchanged when fix requests no edits", async () => {
		expect.assertions(1);
		const source = '<div foo="bar"></div>';
		const result = await applyFix("test.html", source, () => {
			/* do nothing */
		});
		expect(result).toBe(source);
	});

	it("should support asynchronous fix callbacks", async () => {
		expect.assertions(1);
		const source = '<div foo="bar"></div>';
		const result = await applyFix("test.html", source, async (fixer) => {
			await Promise.resolve();
			fixer.replaceText(loc(5, 3), "lorem");
		});
		expect(result).toBe('<div lorem="bar"></div>');
	});
});
