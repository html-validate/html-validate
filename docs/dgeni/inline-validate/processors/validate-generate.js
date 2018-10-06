module.exports = function generateInlineValidationsProcessor(log, validateMap) {
	return {
		$runAfter: ['adding-extra-docs'],
		$runBefore: ['extra-docs-added'],
		$process,
	};

	function $process(docs) {
		validateMap.forEach(validation => {
			// Create the doc that will be injected into the website as a inline validation
			const inlineValidationDoc = createInlineValidateDoc(validation);
			docs.push(inlineValidationDoc);
			validation.inlineValidationDoc = inlineValidationDoc;

			// Create external files
			docs.push(createConfigurationDoc(validation));
			docs.push(createMarkupDoc(validation));
		});
	}

	function createMarkupDoc(validation) {
		return {
			docType: 'validate-markup',
			id: `${validation.id}/markup.html`,
			fileInfo: validation.doc.fileInfo,
			startingLine: validation.doc.startingLine,
			endingLine: validation.doc.endingLine,
			validate: validation,
			template: 'template.html',
			fileContents: validation.markup,
			path: 'markup.html',
		};
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

	function createConfigurationDoc(validation) {
		return {
			id: `${validation.id}/.htmlvalidate.json`,
			docType: 'validate-config',
			validate: validation,
			template: 'template.json',
			fileContents: JSON.stringify(validation.config, null, 2),
		};
	}
};
