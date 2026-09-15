import { assertValidLocation } from "../location";
import { type Autofix } from "./autofix";
import { getBoundSourceText } from "./bind-autofix";
import { type TextEdit, TextEditKind } from "./text-edit";
import { trimText } from "./trim-text";

function assertNoOverlap(current: TextEdit, previous: TextEdit): void {
	const { location: currentLocation } = current;
	const { location: previousLocation } = previous;
	const currentEnd = currentLocation.offset + currentLocation.size;
	/* edits sharing the same offset are ambiguous regardless of size: which
	 * one applies "first" would otherwise depend on callback/array order */
	const sameOffset = currentLocation.offset === previousLocation.offset;
	if (currentEnd > previousLocation.offset || sameOffset) {
		throw new Error("Overlapping edits detected");
	}
}

/**
 * Collect all edits from a autofix callback.
 *
 * The returned edits are sorted in reverse (descending) offset order, the
 * order required to safely apply them back-to-front, regardless of the order
 * they were requested in by the callback.
 *
 * @public
 * @since 11.16.0
 * @see https://html-validate.org/api/autofix-collect-edits.html
 * @param fix - An autofix callback bound to its source text using {@link createAutofix}.
 * @throws Error If an edit has an invalid or out-of-bounds location, or if
 * two edits overlap.
 */
export async function autofixCollectEdits(fix: Autofix): Promise<TextEdit[]>;

/**
 * Collect all edits from a autofix callback.
 *
 * @public
 * @since 11.13.0
 * @deprecated Since 11.16.0, `text` is ignored, remove this parameter.
 * @see https://html-validate.org/api/autofix-collect-edits.html
 * @param fix - An autofix callback bound to its source text using {@link createAutofix}.
 * @param text - Ignored.
 * @throws Error If an edit has an invalid or out-of-bounds location, or if
 * two edits overlap.
 */
/* eslint-disable-next-line @typescript-eslint/unified-signatures -- this signature is deprecated, the other is not */
export async function autofixCollectEdits(fix: Autofix, text: string): Promise<TextEdit[]>;

export async function autofixCollectEdits(fix: Autofix): Promise<TextEdit[]> {
	const text = getBoundSourceText(fix);
	const edits: TextEdit[] = [];

	await fix({
		insertTextBefore(location, insert) {
			assertValidLocation(location, text.length);
			edits.push({
				kind: TextEditKind.Insert,
				location: {
					offset: location.offset,
					size: 0,
				},
				insert,
			});
		},
		insertTextAfter(location, insert) {
			assertValidLocation(location, text.length);
			edits.push({
				kind: TextEditKind.Insert,
				location: {
					offset: location.offset + location.size,
					size: 0,
				},
				insert,
			});
		},
		replaceText(location, replacement) {
			assertValidLocation(location, text.length);
			edits.push({
				kind: TextEditKind.Replace,
				location: {
					offset: location.offset,
					size: location.size,
				},
				replacement,
			});
		},
		removeText(location, options = {}) {
			assertValidLocation(location, text.length);
			const { trimStart = false, trimEnd = false } = options;
			const trimmed = trimText(location, text, { trimStart, trimEnd });
			edits.push({
				kind: TextEditKind.Remove,
				location: {
					offset: trimmed.offset,
					size: trimmed.size,
				},
			});
		},
	});

	/* sort in descending offset order so earlier edits are unaffected by
	 * offset changes caused by later (from the beginning of the string)
	 * replacements */
	const sorted = edits.toSorted((a, b) => b.location.offset - a.location.offset);

	for (let i = 1; i < sorted.length; i++) {
		assertNoOverlap(sorted[i], sorted[i - 1]);
	}

	return sorted;
}
