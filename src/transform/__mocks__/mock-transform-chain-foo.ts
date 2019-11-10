import { Source } from "../../context";
import { Transformer, TransformContext } from "..";

/**
 * Mock transformer chaining to a .foo file transformer.
 */
module.exports = function* mockTransformChainFoo(
	this: TransformContext,
	source: Source
) {
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
} as Transformer;
