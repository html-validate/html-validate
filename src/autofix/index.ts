export { applyTextEdits } from "./apply-text-edits";
export { applyFix } from "./apply-fix";
export { type Autofix, type AutofixFn } from "./autofix";
export { bindAutofix, getBoundSourceText } from "./bind-autofix";
export { createAutofix } from "./create-autofix";
/* eslint-disable-next-line @typescript-eslint/no-deprecated -- re-exporting, not calling, the deprecated overload */
export { autofixCollectEdits } from "./autofix-collect-edits";
export { isAutofix } from "./is-autofix";
export {
	type TextEdit,
	type TextEditInsert,
	type TextEditRemove,
	type TextEditReplace,
	TextEditKind,
} from "./text-edit";
