const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");

module.exports = function copySchemaProcessor(copySchema, readFilesProcessor) {
	return {
		$runBefore: ["extra-docs-added"],
		$process,
	};

	function $process() {
		const root = readFilesProcessor.basePath;
		const outputFolder = path.join(root, copySchema.outputFolder);

		mkdirp.sync(outputFolder);

		for (const src of copySchema.files) {
			const name = path.basename(src);
			fs.copyFileSync(path.join(root, src), path.join(outputFolder, name));
		}
	}
};
