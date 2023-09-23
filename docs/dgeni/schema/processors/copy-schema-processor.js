const path = require("node:path");
const fs = require("fs");

module.exports = function copySchemaProcessor(copySchema, readFilesProcessor) {
	return {
		$runBefore: ["extra-docs-added"],
		$process,
	};

	function $process(docs) {
		const root = readFilesProcessor.basePath;
		const outputFolder = copySchema.outputFolder;

		for (const src of copySchema.files) {
			const { base, name } = path.parse(src);
			docs.push({
				id: `schema:${name}`,
				name: `schemas/${name}`,
				docType: "schema",
				fileContents: fs.readFileSync(path.join(root, src), "utf-8"),
				path: path.join(outputFolder, base),
				template: "schema.json",
			});
		}
	}
};
