const path = require("canonical-path");
const packagePath = __dirname;
const Package = require("dgeni").Package;

module.exports = new Package("schema", [])
	.processor(require("./processors/copy-schema-processor"))
	.factory(require("./services/copy-schema"))

	.config(function(computeIdsProcessor, computePathsProcessor, templateFinder) {
		templateFinder.templateFolders.push(path.resolve(packagePath, "templates"));
		computeIdsProcessor.idTemplates.push({
			docTypes: ["schema"],
			getAliases: function(doc) {
				return [doc.id, doc.name];
			},
		});
		computePathsProcessor.pathTemplates.push({
			docTypes: ["schema"],
			outputPathTemplate: "${path}",
		});
	});
