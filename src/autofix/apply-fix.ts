import { applyTextEdits } from "./apply-text-edits";
import { type Autofix } from "./autofix";
import { autofixCollectEdits } from "./autofix-collect-edits";
import { getBoundSourceText } from "./bind-autofix";

/**
 * Apply a fix (or suggestion) callback to source text and return the patched
 * result.
 *
 * This is a low-level primitive: it does not run validation or know
 * anything about {@link Message} or {@link Report}, it merely runs the
 * given callback, collects the requested edits and applies them to the
 * source text it was bound to.
 *
 * @internal
 * @param fix - Fix or suggestion callback, e.g. `message.fix` or
 * `message.suggestions[n].fix`.
 * @returns The patched source text.
 */
export async function applyFix(fix: Autofix): Promise<string> {
	const source = getBoundSourceText(fix);
	const edits = await autofixCollectEdits(fix);
	return applyTextEdits(source, edits);
}
