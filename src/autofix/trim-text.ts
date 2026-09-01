import { type Location } from "../location";

/**
 * Check if a character is whitespace (space, tab, carriage return).
 * Does not include newlines.
 */
function isWhitespace(char: string): boolean {
	return [" ", "\t"].includes(char);
}

/**
 * Shifts the offset left to include any leading whitespace.
 *
 * @internal
 */
export function trimStart(offset: number, text: string): { offset: number; newline: boolean } {
	let p = offset - 1;

	while (p >= 0 && isWhitespace(text[p])) {
		p--;
	}

	const newline = p >= 0 && text[p] === "\n";
	if (newline) {
		p--;
		/* treat "\r\n" as a single newline */
		if (p >= 0 && text[p] === "\r") {
			p--;
		}
	}

	return { offset: p + 1, newline };
}

/**
 * Shifts the offset right to include any trailing whitespace.
 *
 * @internal
 */
export function trimEnd(
	offset: number,
	text: string,
	options: { allowNewline: boolean },
): { offset: number } {
	const { allowNewline } = options;
	let p = offset;

	while (p < text.length && isWhitespace(text[p])) {
		p++;
	}

	if (allowNewline) {
		if (text[p] === "\r" && text[p + 1] === "\n") {
			p += 2;
		} else if (text[p] === "\n") {
			p++;
		}
	}

	return { offset: p };
}

/**
 * Expand a location by trimming adjacent whitespace.
 *
 * @internal
 */
export function trimText(
	location: Pick<Location, "offset" | "size">,
	text: string,
	options: {
		trimStart: boolean;
		trimEnd: boolean;
	},
): Pick<Location, "offset" | "size"> {
	let { offset, size } = location;

	if (!options.trimStart && !options.trimEnd) {
		return { offset, size };
	}

	let allowNewline = true;
	if (options.trimStart) {
		const trimmed = trimStart(offset, text);
		size += offset - trimmed.offset;
		offset = trimmed.offset;
		allowNewline = !trimmed.newline;
	}

	if (options.trimEnd) {
		const trimmed = trimEnd(offset + size, text, { allowNewline });
		size = trimmed.offset - offset;
	}

	return { offset, size };
}
