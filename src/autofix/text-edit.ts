import { type Location } from "../location";

/**
 * Discriminators identifying the different kinds of {@link TextEdit}.
 *
 * @public
 * @since %version%
 */
/* eslint-disable-next-line @typescript-eslint/no-extraneous-class -- unique symbols are only allowed on "const" and "static readonly" properties */
export class TextEditKind {
	public static readonly Replace: unique symbol = Symbol("text-edit-replace");
	public static readonly Remove: unique symbol = Symbol("text-edit-remove");
}

/**
 * An autofix text edit replacing text at location.
 *
 * @public
 * @since %version%
 */
export interface TextEditReplace {
	/** Discriminator identifying this as a replace edit. */
	readonly kind: typeof TextEditKind.Replace;

	/** Location of the text being replaced. */
	readonly location: Pick<Location, "offset" | "size">;

	/** Text to replace the current text with. */
	readonly replacement: string;
}

/**
 * An autofix text edit removing text at location.
 *
 * @public
 * @since %version%
 */
export interface TextEditRemove {
	/** Discriminator identifying this as a remove edit. */
	readonly kind: typeof TextEditKind.Remove;

	/** Location of the text being removed. */
	readonly location: Pick<Location, "offset" | "size">;
}

/**
 * An autofix text edit.
 *
 * @public
 * @since %version%
 */
export type TextEdit = TextEditReplace | TextEditRemove;
