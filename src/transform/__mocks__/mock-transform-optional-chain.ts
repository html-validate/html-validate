import { type Source } from "../../context";
import {
	type TransformContext,
	type Transformer,
	type TransformerResult,
	TRANSFORMER_API,
} from "..";

/**
 * Mock transformer chaining to a new transformer by chopping of the current
 * extension. E.g. "my-file.bar.foo" to "my-file.bar".
 */
function mockTransformOptionalChain(this: TransformContext, source: Source): TransformerResult {
	const next = source.filename.replace(/\.[^.]*$/, "");
	if (this.hasChain(next)) {
		return this.chain(
			{
				data: `data from mock-transform-optional-chain (was: ${source.data})`,
				filename: source.filename,
				line: 1,
				column: 1,
				offset: 0,
				originalData: source.originalData ?? source.data,
			},
			next,
		);
	}
	return [];
}

/* mocks are always written against current version */
mockTransformOptionalChain.api = TRANSFORMER_API.VERSION;

module.exports = mockTransformOptionalChain as Transformer;
