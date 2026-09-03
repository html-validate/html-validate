import { type ErrorFixer } from "../error-fixer";
import { applyTextEdits } from "./apply-text-edits";
import { autofixCollectEdits } from "./autofix-collect-edits";

/**
 * Apply a fix (or suggestion) callback to source text and return the patched
 * result.
 *
 * This is a low-level primitive: it does not run validation or know
 * anything about {@link Message} or {@link Report}, it merely runs the
 * given callback, collects the requested edits and applies them to `source`.
 *
 * @internal
 * @param source - Original source text.
 * @param fix - Fix or suggestion callback, e.g. `message.fix` or
 * `message.suggestions[n].fix`.
 * @returns The patched source text.
 */
export async function applyFix(
	source: string,
	fix: (fixer: ErrorFixer) => void | Promise<void>,
): Promise<string> {
	const edits = await autofixCollectEdits(fix, source);
	return applyTextEdits(source, edits);
}
