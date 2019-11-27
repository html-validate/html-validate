import fs from "fs";
import { TransformContext, Transformer } from ".";
import { Source } from "../context";

/**
 * Helper function to call a transformer function in test-cases.
 *
 * @param fn - Transformer function to call.
 * @param filename - Filename to read data from. Must be readable.
 * @param chain - If set this function is called when chaining transformers. Default is pass-thru.
 */
export function transformFile(
	fn: Transformer,
	filename: string,
	chain?: (source: Source, filename: string) => Iterable<Source>
): Source[] {
	const data = fs.readFileSync(filename, "utf-8");
	const source: Source = {
		filename,
		line: 1,
		column: 1,
		data,
	};
	return transformSource(fn, source, chain);
}

/**
 * Helper function to call a transformer function in test-cases.
 *
 * @param fn - Transformer function to call.
 * @param data - String to transform.
 * @param chain - If set this function is called when chaining transformers. Default is pass-thru.
 */
export function transformString(
	fn: Transformer,
	data: string,
	chain?: (source: Source, filename: string) => Iterable<Source>
): Source[] {
	const source: Source = {
		filename: "inline",
		line: 1,
		column: 1,
		data,
	};
	return transformSource(fn, source, chain);
}

/**
 * Helper function to call a transformer function in test-cases.
 *
 * @param fn - Transformer function to call.
 * @param data - Source to transform.
 * @param chain - If set this function is called when chaining transformers. Default is pass-thru.
 */
export function transformSource(
	fn: Transformer,
	source: Source,
	chain?: (source: Source, filename: string) => Iterable<Source>
): Source[] {
	const defaultChain = (source: Source): Iterable<Source> => [source];
	const context: TransformContext = {
		hasChain: /* istanbul ignore next */ () => true,
		chain: chain || defaultChain,
	};
	return Array.from(fn.call(context, source));
}
