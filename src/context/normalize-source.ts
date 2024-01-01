import { type Source } from "./source";

/**
 * Ensures all fields are set to something sane. This wont normally be needed
 * but with non-typescript usage (or if one is lying to typescript `as Source`)
 * some fields might be missing after all.
 *
 * This function is only to be called at API boundaries and not internally
 * inside the codebase.
 *
 * @internal
 */
export function normalizeSource(source: Partial<Source> & Pick<Source, "data">): Source {
	return {
		filename: "",
		offset: 0,
		line: 1,
		column: 1,
		...source,
	};
}
