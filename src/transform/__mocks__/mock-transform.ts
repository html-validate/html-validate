import { Source } from "../../context";
import { Transformer, TRANSFORMER_API } from "..";

/**
 * Transformer returning a single mocked source.
 */
function mockTransform(source: Source): Iterable<Source> {
	return [
		{
			data: `transformed source (was: ${source.data})`,
			filename: source.filename,
			line: 1,
			column: 1,
			originalData: source.originalData || source.data,
		},
	];
}

/* mocks are always written against current version */
mockTransform.api = TRANSFORMER_API.VERSION;

module.exports = mockTransform as Transformer;
