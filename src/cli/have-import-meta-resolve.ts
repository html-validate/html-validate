/**
 * @internal
 */
export function haveImportMetaResolve(): boolean {
	return "resolve" in import.meta;
}
