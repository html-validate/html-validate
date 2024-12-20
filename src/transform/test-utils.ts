import fs from "fs";
import {
	type Source,
	type TransformContext,
	type Transformer,
	type TransformerChainedResult,
} from "html-validate";

/* eslint-disable-next-line import/no-extraneous-dependencies -- this is the package itself */
export {
	type Source,
	type Transformer,
	type TransformerResult,
	type TransformerChainedResult,
} from "html-validate";

function isIterable(
	value: Source | Iterable<Source | Promise<Source>>,
): value is Iterable<Source | Promise<Source>> {
	return Symbol.iterator in value;
}

/**
 * Helper function to call a transformer function in test-cases.
 *
 * @public
 * @param fn - Transformer function to call.
 * @param filename - Filename to read data from. Must be readable.
 * @param chain - If set this function is called when chaining transformers. Default is pass-thru.
 */
export function transformFile(
	fn: Transformer,
	filename: string,
	chain?: (source: Source, filename: string) => TransformerChainedResult,
): Promise<Source[]> {
	const data = fs.readFileSync(filename, "utf-8");
	const source: Source = {
		filename,
		line: 1,
		column: 1,
		offset: 0,
		data,
	};
	return transformSource(fn, source, chain);
}

/**
 * Helper function to call a transformer function in test-cases.
 *
 * @public
 * @param fn - Transformer function to call.
 * @param data - String to transform.
 * @param chain - If set this function is called when chaining transformers. Default is pass-thru.
 */
export function transformString(
	fn: Transformer,
	data: string,
	chain?: (source: Source, filename: string) => TransformerChainedResult,
): Promise<Source[]> {
	const source: Source = {
		filename: "inline",
		line: 1,
		column: 1,
		offset: 0,
		data,
	};
	return transformSource(fn, source, chain);
}

/**
 * Helper function to call a transformer function in test-cases.
 *
 * @public
 * @param fn - Transformer function to call.
 * @param data - Source to transform.
 * @param chain - If set this function is called when chaining transformers. Default is pass-thru.
 */
export async function transformSource(
	fn: Transformer,
	source: Source,
	chain?: (source: Source, filename: string) => TransformerChainedResult,
): Promise<Source[]> {
	const defaultChain = (source: Source): Iterable<Source> => [source];
	const context: TransformContext = {
		hasChain: /* istanbul ignore next */ () => true,
		chain: chain ?? defaultChain,
	};
	const result = await fn.call(context, source);
	if (isIterable(result)) {
		return await Promise.all(Array.from(result));
	} else {
		return [result];
	}
}
