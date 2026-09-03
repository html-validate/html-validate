import { type TextEdit, TextEditKind } from "./text-edit";

function applyTextEdit(text: string, edit: TextEdit): string {
	switch (edit.kind) {
		case TextEditKind.Replace: {
			const { location, replacement } = edit;
			const { offset, size } = location;
			return text.slice(0, offset) + replacement + text.slice(offset + size);
		}
		case TextEditKind.Remove: {
			const { location } = edit;
			const { offset, size } = location;
			return text.slice(0, offset) + text.slice(offset + size);
		}
	}
}

/**
 * Apply a set of text edits to source text.
 *
 * Edits are assumed to be presorted in reverse (decending) order and that no
 * overlaps in locations are present.
 *
 * @internal
 * @param text - Original source text.
 * @param edits - Edits to apply.
 * @returns The patched source text.
 */
export function applyTextEdits(text: string, edits: readonly TextEdit[]): string {
	if (edits.length === 0) {
		return text;
	}

	let result = text;
	for (const edit of edits) {
		result = applyTextEdit(result, edit);
	}
	return result;
}
