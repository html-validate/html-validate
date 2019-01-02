/**
 * Transformer returning a single mocked source.
 */
module.exports = function mockTransform(filename: string) {
	return [
		{
			data: "mocked source",
			filename,
			line: 1,
			column: 1,
			originalData: "mocked original source",
		},
	];
};
