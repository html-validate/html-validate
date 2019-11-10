import { Source } from "../../context";
import { Transformer } from "..";

/**
 * Transformer returning a single mocked source.
 */
module.exports = function mockTransform(source: Source) {
	return [
		{
			data: `transformed source (was: ${source.data})`,
			filename: source.filename,
			line: 1,
			column: 1,
			originalData: source.originalData || source.data,
		},
	];
} as Transformer;
