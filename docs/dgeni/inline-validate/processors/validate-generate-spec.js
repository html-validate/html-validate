module.exports = function generateValidationsSpecProcessor(log, validateMap) {
	return {
		$runAfter: ['generateValidationResultsProcessor'],
		$runBefore: ['extra-docs-added'],
		$process,
	};

	function $process(docs) {
		const specs = {};

		validateMap.forEach(validation => {
			const file = validation.doc.fileInfo.relativePath;

			if (!specs[file]){
				specs[file] = [];
			}

			specs[file].push(validation);
		});

		for (const [file, validations] of Object.entries(specs)) {
			docs.push(createSpec(file, validations));
		}
	}

	function createSpec(file, validations) {
		return {
			docType: 'validate-spec',
			id: `${file}.spec.ts`,
			file,
			validations,
			template: 'spec-jest.ts',
		};
	}
};
