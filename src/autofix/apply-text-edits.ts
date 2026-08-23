import { type Location } from "../location";
import { type TextEdit, TextEditKind } from "./text-edit";

function verifyLocation(
	filename: string,
	location: Pick<Location, "filename" | "offset" | "size">,
	text: string,
): void {
	if (location.filename !== filename) {
		throw new Error(`Cannot apply edit for "${location.filename}" while patching "${filename}"`);
	}
	if (location.offset < 0 || location.offset + location.size > text.length) {
		throw new Error(
			`Edit location (offset ${location.offset}, size ${location.size}) is out of bounds for "${filename}"`,
		);
	}
}

function verifyOverlap(
	filename: string,
	current: Pick<Location, "offset" | "size">,
	previous: Pick<Location, "offset" | "size">,
): void {
	const currentEnd = current.offset + current.size;
	/* edits sharing the same offset are ambiguous regardless of size: which
	 * one applies "first" would otherwise depend on callback/array order */
	const sameOffset = current.offset === previous.offset;
	if (currentEnd > previous.offset || sameOffset) {
		throw new Error(`Overlapping edits detected in "${filename}"`);
	}
}

function applyTextEdit(text: string, edit: TextEdit): string {
	switch (edit.kind) {
		case TextEditKind.Replace: {
			const { location, replacement } = edit;
			const { offset, size } = location;
			return text.slice(0, offset) + replacement + text.slice(offset + size);
		}
	}
}

/**
 * Apply a set of text edits to source text.
 *
 * All edits must use locations from the *original* (unmodified) source text
 * passed to this function, edits are not applied incrementally. Edits are
 * internally applied from the end of the source towards the beginning so
 * earlier offsets are never affected by later replacements.
 *
 * @internal
 * @param filename - Filename the edits and source belongs to, used to
 * sanity-check that edits are not applied to the wrong source.
 * @param text - Original source text.
 * @param edits - Edits to apply.
 * @returns The patched source text.
 */
export function applyTextEdits(filename: string, text: string, edits: readonly TextEdit[]): string {
	if (edits.length === 0) {
		return text;
	}

	/* apply in descending offset order so earlier edits are unaffected by
	 * offset changes caused by later (from the beginning of the string)
	 * replacements */
	const sorted = edits.toSorted((a, b) => b.location.offset - a.location.offset);

	for (const { location } of sorted) {
		verifyLocation(filename, location, text);
	}

	for (let i = 1; i < sorted.length; i++) {
		const previous = sorted[i - 1];
		const current = sorted[i];
		verifyOverlap(filename, current.location, previous.location);
	}

	let result = text;
	for (const edit of sorted) {
		result = applyTextEdit(result, edit);
	}
	return result;
}
