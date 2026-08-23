import { type Location } from "../location";

const Replace = Symbol("text-edit-replace");

/**
 * Discriminators identifying the different kinds of {@link TextEdit}.
 *
 * @internal
 */
export const TextEditKind = {
	Replace,
} as const;

/**
 * A single text replacement collected from an {@link ErrorFixer} callback.
 *
 * @internal
 */
export interface TextEditReplace {
	/** Discriminator identifying this as a replace edit. */
	kind: typeof TextEditKind.Replace;

	/** Location of the text being replaced. */
	location: Pick<Location, "filename" | "offset" | "size">;

	/** Text to replace the current text with. */
	replacement: string;
}

/**
 * A single edit collected from an {@link ErrorFixer} callback.
 *
 * Currently the only kind of edit is {@link TextEditReplace} but this is a
 * union to allow other kinds of edits to be added in the future.
 *
 * @internal
 */
export type TextEdit = TextEditReplace;
