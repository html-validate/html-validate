/**
 * @dgProcessor computePathsProcessor
 * @description Compute the path and outputPath for docs that do not already have them from a set of templates
 */
module.exports = function computePathsProcessor(log, createDocMessage) {
	function initializeMaps(pathTemplates) {
		const pathTemplateMap = new Map();
		const outputPathTemplateMap = new Map();

		for (const template of pathTemplates) {
			if (template.docTypes) {
				for (const docType of template.docTypes) {
					if (template.getPath) {
						pathTemplateMap[docType] = template.getPath;
					} else if (template.pathTemplate) {
						throw new Error(`pathTemplate not supported, use getPath() instead`);
					}

					if (template.getOutputPath) {
						outputPathTemplateMap[docType] = template.getOutputPath;
					} else if (template.outputPathTemplate) {
						throw new Error(`outputPathTemplate not supported, use getOutputPath() instead`);
					}
				}
			}
		}
		return { pathTemplateMap, outputPathTemplateMap };
	}

	return {
		$validate: {
			pathTemplates: { presence: true },
		},
		pathTemplates: [],
		$runAfter: ["computing-paths"],
		$runBefore: ["paths-computed"],
		$process(docs) {
			const { pathTemplateMap, outputPathTemplateMap } = initializeMaps(this.pathTemplates);

			for (const doc of docs) {
				try {
					if (!doc.path) {
						const getPath = pathTemplateMap[doc.docType];
						if (!getPath) {
							log.warn(createDocMessage("No path template provided", doc));
						} else {
							doc.path = getPath(doc);
						}
					}

					if (!doc.outputPath) {
						const getOutputPath = outputPathTemplateMap[doc.docType];
						if (!getOutputPath) {
							log.warn(createDocMessage("No output path template provided", doc));
						} else {
							doc.outputPath = getOutputPath(doc);
						}
					}
				} catch (err) {
					throw new Error(createDocMessage("Failed to compute paths for doc", doc, err));
				}

				log.debug(createDocMessage(`path: ${doc.path}; outputPath: ${doc.outputPath}`, doc));
			}
		},
	};
};
