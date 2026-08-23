import { type ErrorFixer } from "../error-fixer";
import { type Location, assertValidLocation } from "../location";
import { type TextEdit, TextEditKind } from "./text-edit";

/**
 * Invoke a fix (or suggestion) callback and collect all edits it requests.
 *
 * The callback is given a fresh {@link ErrorFixer} so calls to
 * `replaceText()` always refer to the original, unmodified source, even if
 * multiple calls are made.
 *
 * @internal
 */
export async function collectTextEdits(
	fix: (fixer: ErrorFixer) => void | Promise<void>,
): Promise<TextEdit[]> {
	const edits: TextEdit[] = [];

	await fix({
		replaceText(location: Location, replacement: string): void {
			assertValidLocation(location);
			edits.push({ kind: TextEditKind.Replace, location, replacement });
		},
	});

	return edits;
}
