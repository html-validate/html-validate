import { type ErrorFixer } from "../error-fixer";
import { applyTextEdits } from "./apply-text-edits";
import { collectTextEdits } from "./collect-text-edits";

/**
 * Apply a fix (or suggestion) callback to source text and return the patched
 * result.
 *
 * This is a low-level primitive: it does not run validation or know
 * anything about {@link Message} or {@link Report}, it merely runs the
 * given callback, collects the requested edits and applies them to `source`.
 *
 * @internal
 * @param filename - Filename the source belongs to. Used to sanity-check
 * that the fix does not target a different file.
 * @param source - Original source text.
 * @param fix - Fix or suggestion callback, e.g. `message.fix` or
 * `message.suggestions[n].fix`.
 * @returns The patched source text.
 */
export async function applyFix(
	filename: string,
	source: string,
	fix: (fixer: ErrorFixer) => void | Promise<void>,
): Promise<string> {
	const edits = await collectTextEdits(fix, source);
	return applyTextEdits(filename, source, edits);
}
