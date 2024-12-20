import { type Source } from "../context";
import { type TransformContext } from "./context";
import { type TransformerResult } from "./transformer-result";

/**
 * Transform a file or text into one or more plain HTML.
 *
 * @public
 */
export interface Transformer {
	/**
	 * Callback function to transform a source to plain HTML sources.
	 *
	 * Since 9.0.0-rc.8 the transformer may return:
	 *
	 * - A single `Source` object or a `Promise` resolving to one.
	 * - An array of `Source` objects or a `Promise` resolving to one.
	 * - An array of `Promise` resolving to `Source` objects.
	 */
	(this: TransformContext, source: Source): TransformerResult;

	/**
	 * API version. Must be specified, it is deprecated to leave it out as it
	 * assumes version 0 (deprecated version).
	 */
	api?: number;
}
