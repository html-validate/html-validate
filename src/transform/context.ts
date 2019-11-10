import { Source } from "../context";

export interface TransformContext {
	/**
	 * Chain transformations.
	 *
	 * Sometimes multiple transformers must be applied. For instance, a Markdown
	 * file with JSX in a code-block.
	 *
	 * @param source - Source to chain transformations on.
	 * @param filename - Filename to use to match next transformer (unrelated to
	 * filename set in source)
	 */
	chain(source: Source, filename: string): Source[];
}
