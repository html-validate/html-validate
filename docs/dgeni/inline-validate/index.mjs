import path from "canonical-path";
import Dgeni from "dgeni";

import inlineValidation from "./inline-tag-defs/inline-validation.mjs";
import validateGeneratePublic from "./processors/validate-generate-public.mjs";
import validateGenerateSpec from "./processors/validate-generate-spec.mjs";
import validateGenerate from "./processors/validate-generate.mjs";
import validateParse from "./processors/validate-parse.mjs";
import validateResults from "./processors/validate-results.mjs";
import validateMap from "./services/validate-map.mjs";

const { Package } = Dgeni;
const packagePath = import.meta.dirname;

export default new Package("inline-validate", [])

	.processor(validateParse)
	.processor(validateGenerate)
	.processor(validateResults)
	.processor(validateGeneratePublic)
	.processor(validateGenerateSpec)

	.factory(validateMap)
	.factory(inlineValidation)

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
