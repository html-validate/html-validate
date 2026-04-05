import path from "node:path";

/**
 * @param {Map<string, unknown>} validateMap
 */
export default function generateValidationsSpecProcessor(log, validateMap) {
	return {
		$runAfter: ["generateValidationResultsProcessor"],
		$runBefore: ["extra-docs-added"],
		$process,
	};

	function $process(docs) {
		const specs = {};

		for (const validation of validateMap.values()) {
			const key = validation.doc.fileInfo.relativePath;

			if (!specs[key]) {
				specs[key] = [];
			}

			specs[key].push(validation);
		}

		for (const validations of Object.values(specs)) {
			const fileInfo = validations[0].doc.fileInfo;
			docs.push(createSpec(fileInfo, validations));
		}
	}

	function createSpec(fileInfo, validations) {
		return {
			docType: "validate-spec",
			id: `${fileInfo.relativePath}/spec`,
			fileInfo: {
				path: path.dirname(fileInfo.projectRelativePath),
				file: path.basename(fileInfo.projectRelativePath),
				fullpath: fileInfo.projectRelativePath,
				docRoot: path.dirname(fileInfo.projectRelativePath).replaceAll(/[^/]+/g, ".."),
			},
			validations,
			template: "spec-jest.ts.njk",
		};
	}
}
