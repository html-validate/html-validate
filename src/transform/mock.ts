import { Source } from "../context";

/**
 * Transformer returning a single mocked source.
 */
module.exports = function mockTransform(source: Source) {
	return [
		{
			data: "mocked source",
			filename: source.filename,
			line: 1,
			column: 1,
			originalData: source.originalData || source.data,
		},
	];
};
