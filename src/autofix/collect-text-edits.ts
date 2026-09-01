import { type ErrorFixer } from "../error-fixer";
import { assertValidLocation } from "../location";
import { type TextEdit, TextEditKind } from "./text-edit";
import { trimText } from "./trim-text";

/**
 * Invoke a fix (or suggestion) callback and collect all edits it requests.
 *
 * @internal
 */
export async function collectTextEdits(
	fix: (fixer: ErrorFixer) => void | Promise<void>,
	text: string,
): Promise<TextEdit[]> {
	const edits: TextEdit[] = [];

	await fix({
		replaceText(location, replacement): void {
			assertValidLocation(location, text.length);
			edits.push({
				kind: TextEditKind.Replace,
				location,
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
					filename: location.filename,
					offset: trimmed.offset,
					size: trimmed.size,
				},
			});
		},
	});

	return edits;
}
