import { Source } from "../../context";
import { Transformer, TransformContext, TRANSFORMER_API } from "..";

/**
 * Mock transformer chaining to a .foo file transformer.
 */
function* mockTransformChainFoo(
	this: TransformContext,
	source: Source
): Iterable<Source> {
	yield* this.chain(
		{
			data: `data from mock-transform-chain-foo (was: ${source.data})`,
			filename: source.filename,
			line: 1,
			column: 1,
			originalData: source.originalData || source.data,
		},
		`${source.filename}.foo`
	);
}

/* mocks are always written against current version */
mockTransformChainFoo.api = TRANSFORMER_API.VERSION;

module.exports = mockTransformChainFoo as Transformer;
