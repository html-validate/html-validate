import { type Source } from "../context";

/**
 * The result of a transformer (or its chain).
 *
 * @public
 * @since %version%
 */
export type TransformerResult =
	| Iterable<Source | Promise<Source>>
	| Promise<Iterable<Source | Promise<Source>>>;

/**
 * The result of a transformer chain.
 *
 * Similar to the regular `TransformerResult` but flattened for easier usage.
 *
 * @public
 * @since %version%
 */
export type TransformerChainedResult = Iterable<Source> | Promise<Iterable<Source>>;
