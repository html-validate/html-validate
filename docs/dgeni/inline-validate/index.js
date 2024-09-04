const path = require("canonical-path");

const packagePath = __dirname;
const Package = require("dgeni").Package;

module.exports = new Package("inline-validate", [])

	.processor(require("./processors/validate-parse"))
	.processor(require("./processors/validate-generate"))
	.processor(require("./processors/validate-results"))
	.processor(require("./processors/validate-generate-public"))
	.processor(require("./processors/validate-generate-spec"))

	.factory(require("./services/validateMap"))
	.factory(require("./inline-tag-defs/inline-validation"))

	.config(function (templateFinder) {
		templateFinder.templateFolders.push(path.resolve(packagePath, "templates"));
	})

	.config(function (inlineTagProcessor, inlineValidationInlineTagDef) {
		inlineTagProcessor.inlineTagDefinitions.push(inlineValidationInlineTagDef);
	})

	.config(function (computePathsProcessor, computeIdsProcessor) {
		computePathsProcessor.pathTemplates.push({
			docTypes: ["validate-config", "validate-markup"],
			getPath() {},
			getOutputPath(doc) {
				return `inline-validations/${doc.id}`;
			},
		});
		computePathsProcessor.pathTemplates.push({
			docTypes: ["validate-spec"],
			getPath() {},
			getOutputPath(doc) {
				return `../${doc.fileInfo.path}/__tests__/${doc.fileInfo.file}.spec.ts`;
			},
		});
		computePathsProcessor.pathTemplates.push({
			docTypes: ["validate-public"],
			getPath() {},
			getOutputPath(doc) {
				return `examples/${doc.validate.fingerprint}.json`;
			},
		});
		computePathsProcessor.pathTemplates.push({
			docTypes: ["inlineValidation"],
			getPath(doc) {
				return `inline-validations/${doc.validate.id}`;
			},
			getOutputPath() {},
		});
		computeIdsProcessor.idTemplates.push({
			docTypes: [
				"validate-config",
				"validate-markup",
				"validate-spec",
				"validate-public",
				"inlineValidation",
			],
			getAliases(doc) {
				return [doc.id];
			},
		});
	});
