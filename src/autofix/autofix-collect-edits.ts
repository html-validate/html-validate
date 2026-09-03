import { type ErrorFixer } from "../error-fixer";
import { assertValidLocation } from "../location";
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
 * @since %version%
 * @see https://html-validate.org/api/autofix-collect-edits.html
 * @param fix - An autofix callback.
 * @param text - The original text to operate on.
 * @throws Error If an edit has an invalid or out-of-bounds location, or if
 * two edits overlap.
 */
export async function autofixCollectEdits(
	fix: (fixer: ErrorFixer) => void | Promise<void>,
	text: string,
): Promise<TextEdit[]> {
	const edits: TextEdit[] = [];

	await fix({
		replaceText(location, replacement): void {
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
		removeText(location, options = {}): void {
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
