import { type Location } from "../location";

const Replace = Symbol("text-edit-replace");
const Remove = Symbol("text-edit-remove");

/**
 * Discriminators identifying the different kinds of {@link TextEdit}.
 *
 * @internal
 */
export const TextEditKind = {
	Replace,
	Remove,
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
 * A single text removal collected from an {@link ErrorFixer} callback.
 *
 * @internal
 */
export interface TextEditRemove {
	/** Discriminator identifying this as a remove edit. */
	kind: typeof TextEditKind.Remove;

	/** Location of the text being removed. */
	location: Pick<Location, "filename" | "offset" | "size">;
}

/**
 * A single edit collected from an {@link ErrorFixer} callback.
 *
 * @internal
 */
export type TextEdit = TextEditReplace | TextEditRemove;
