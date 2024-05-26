const path = require("node:path");

/**
 * @param {Map<string, unknown>} validateMap
 */
module.exports = function generateValidationsPublicProcessor(validateMap) {
	return {
		$runAfter: ["generateValidationResultsProcessor"],
		$runBefore: ["extra-docs-added"],
		$process,
	};

	function $process(docs) {
		validateMap.forEach((validate) => {
			const fileInfo = validate.doc.fileInfo;
			docs.push(createDocument(fileInfo, validate));
		});
	}

	function createDocument(fileInfo, validate) {
		const data = {
			config: validate.config,
			markup: validate.markup,
		};
		return {
			docType: "validate-public",
			id: `validate-public-${validate.fingerprint}`,
			fileInfo: {
				path: path.dirname(fileInfo.projectRelativePath),
				file: path.basename(fileInfo.projectRelativePath),
				fullpath: fileInfo.projectRelativePath,
				docRoot: path.dirname(fileInfo.projectRelativePath).replace(/[^/]+/g, ".."),
			},
			validate,
			json: JSON.stringify(data, null, 2),
			template: "validate-public.template.json",
		};
	}
};
