import { describe, expect, it } from "@jest/globals";
import { trimText } from "./trim-text";

function remove(
	text: string,
	offset: number,
	size: number,
	options: { trimStart?: boolean; trimEnd?: boolean },
): string {
	const trimmed = trimText({ offset, size }, text, {
		trimStart: options.trimStart ?? false,
		trimEnd: options.trimEnd ?? false,
	});
	return text.slice(0, trimmed.offset) + text.slice(trimmed.offset + trimmed.size);
}

describe("trimText()", () => {
	it("should not expand the location when no trim option is set", () => {
		expect.assertions(1);
		const text = "lorem ipsum dolor sit amet";
		const result = trimText({ offset: 6, size: 5 }, text, { trimStart: false, trimEnd: false });
		expect(result).toEqual({ offset: 6, size: 5 });
	});

	describe("trimStart", () => {
		it("should trim leading whitespace", () => {
			expect.assertions(1);
			const value = "ipsum";
			const text = "lorem   ipsum dolor sit amet";
			const result = remove(text, text.indexOf(value), value.length, { trimStart: true });
			expect(result).toBe("lorem dolor sit amet");
		});

		it("should trim leading newline (LF)", () => {
			expect.assertions(1);
			const value = "ipsum";
			const text = "lorem\nipsum";
			const result = remove(text, text.indexOf(value), value.length, { trimStart: true });
			expect(result).toBe("lorem");
		});

		it("should trim leading newline (CRLF)", () => {
			expect.assertions(1);
			const value = "ipsum";
			const text = "lorem\r\nipsum";
			const result = remove(text, text.indexOf(value), value.length, { trimStart: true });
			expect(result).toBe("lorem");
		});

		it("should only trim first leading newline (LF)", () => {
			expect.assertions(1);
			const value = "ipsum";
			const text = "lorem\n\nipsum";
			const result = remove(text, text.indexOf(value), value.length, { trimStart: true });
			expect(result).toBe("lorem\n");
		});

		it("should only trim first leading newline (CRLF)", () => {
			expect.assertions(1);
			const value = "ipsum";
			const text = "lorem\r\n\r\nipsum";
			const result = remove(text, text.indexOf(value), value.length, { trimStart: true });
			expect(result).toBe("lorem\r\n");
		});

		it("should handle location at start of file", () => {
			expect.assertions(1);
			const text = "lorem ipsum";
			expect(remove(text, 0, 1, { trimStart: true })).toBe("orem ipsum");
		});
	});

	describe("trimEnd", () => {
		it("should trim trailing whitespace", () => {
			expect.assertions(1);
			const value = "ipsum";
			const text = "lorem ipsum   dolor sit amet";
			const result = remove(text, text.indexOf(value), value.length, { trimEnd: true });
			expect(result).toBe("lorem dolor sit amet");
		});

		it("should trim trailing newline (LF)", () => {
			expect.assertions(1);
			const value = "lorem";
			const text = "lorem\nipsum";
			const result = remove(text, text.indexOf(value), value.length, { trimEnd: true });
			expect(result).toBe("ipsum");
		});

		it("should trim trailing newline (CRLF)", () => {
			expect.assertions(1);
			const value = "lorem";
			const text = "lorem\r\nipsum";
			const result = remove(text, text.indexOf(value), value.length, { trimEnd: true });
			expect(result).toBe("ipsum");
		});

		it("should only trim first trailing newline (LF)", () => {
			expect.assertions(1);
			const value = "lorem";
			const text = "lorem\n\nipsum";
			const result = remove(text, text.indexOf(value), value.length, { trimEnd: true });
			expect(result).toBe("\nipsum");
		});

		it("should only trim first trailing newline (CRLF)", () => {
			expect.assertions(1);
			const value = "lorem";
			const text = "lorem\r\n\r\nipsum";
			const result = remove(text, text.indexOf(value), value.length, { trimEnd: true });
			expect(result).toBe("\r\nipsum");
		});

		it("should handle location at end of file", () => {
			expect.assertions(1);
			const text = "lorem ipsum";
			expect(remove(text, 10, 1, { trimEnd: true })).toBe("lorem ipsu");
		});
	});

	it("should trim line when both trimStart and trimEnd is set", () => {
		expect.assertions(1);
		const value = "ipsum";
		const text = "lorem\nipsum\ndolor";
		const result = remove(text, text.indexOf(value), value.length, {
			trimStart: true,
			trimEnd: true,
		});
		expect(result).toBe("lorem\ndolor");
	});

	it("should not leave a stray carriage return when trimEnd cannot consume an already-used newline", () => {
		expect.assertions(1);
		const value = "dolor";
		const text = "lorem\ndolor\r\nsit";
		const result = remove(text, text.indexOf(value), value.length, {
			trimStart: true,
			trimEnd: true,
		});
		expect(result).toBe("lorem\r\nsit");
	});

	it("should handle when no whitespace exists", () => {
		expect.assertions(1);
		const text = "hello";
		const result = remove(text, 1, 3, { trimStart: true, trimEnd: true });
		expect(result).toBe("ho");
	});

	it("should handle tab characters as whitespace", () => {
		expect.assertions(1);
		const value = "ipsum";
		const text = "lorem\tipsum\tdolor";
		const result = remove(text, text.indexOf(value), value.length, {
			trimStart: true,
			trimEnd: true,
		});
		expect(result).toBe("loremdolor");
	});

	it("should handle space characters as whitespace", () => {
		expect.assertions(1);
		const value = "ipsum";
		const text = "lorem ipsum dolor";
		const result = remove(text, text.indexOf(value), value.length, {
			trimStart: true,
			trimEnd: true,
		});
		expect(result).toBe("loremdolor");
	});
});
