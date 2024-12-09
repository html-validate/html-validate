import { type Source } from "../context";
import { type TransformContext } from "./context";

/**
 * Transform a file or text into one or more plain HTML.
 *
 * @public
 */
export interface Transformer {
	/**
	 * Callback function to transform a source to plain HTML sources.
	 */
	(
		this: TransformContext,
		source: Source,
	):
		| Source
		| Iterable<Source | Promise<Source>>
		| Promise<Source>
		| Promise<Source | Iterable<Source | Promise<Source>>>;

	/**
	 * API version. Must be specified, it is deprecated to leave it out as it
	 * assumes version 0 (deprecated version).
	 */
	api?: number;
}
