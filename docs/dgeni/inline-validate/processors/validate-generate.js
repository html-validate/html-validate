module.exports = function generateInlineValidationsProcessor(log, validateMap) {
	return {
		$runAfter: ['generateValidationResultsProcessor'],
		$runBefore: ['extra-docs-added'],
		$process,
	};

	function $process(docs) {
		validateMap.forEach(validation => {
			const inlineValidationDoc = createInlineValidateDoc(validation);
			docs.push(inlineValidationDoc);
			validation.inlineValidationDoc = inlineValidationDoc;
		});
	}

	function createInlineValidateDoc(validation) {
		return {
			id: `${validation.id}-inlineValidation`,
			docType: 'inlineValidation',
			fileInfo: validation.doc.fileInfo,
			startingLine: validation.doc.startingLine,
			endingLine: validation.doc.endingLine,
			validate: validation,
			template: 'inline/inlineValidation.template.html',
		};
	}
};
