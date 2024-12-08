import { type Source } from "../context";
import { type TransformerChainedResult } from "./transformer-result";

/**
 * @public
 */
export interface TransformContext {
	/**
	 * Test if an additional chainable transformer is present.
	 *
	 * Returns true only if there is a transformer configured for the given
	 * filename.
	 *
	 * @param filename - Filename to use to match next transformer.
	 */
	hasChain(filename: string): boolean;

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
	chain(source: Source, filename: string): TransformerChainedResult;
}
