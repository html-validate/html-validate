import path from "canonical-path";
import Dgeni from "dgeni";
import copySchemaProcessor from "./processors/copy-schema-processor.mjs";
import copySchemaService from "./services/copy-schema.mjs";

const { Package } = Dgeni;

const packagePath = import.meta.dirname;

export default new Package("schema", [])
	/* eslint-disable-next-line unicorn/no-unreadable-new-expression -- established pattern for dgeni */
	.processor(copySchemaProcessor)
	.factory(copySchemaService)

	.config(function (computeIdsProcessor, computePathsProcessor, templateFinder) {
		templateFinder.templateFolders.push(path.resolve(packagePath, "templates"));
		computeIdsProcessor.idTemplates.push({
			docTypes: ["schema"],
			getAliases(doc) {
				return [doc.id, doc.name];
			},
		});
		computePathsProcessor.pathTemplates.push({
			docTypes: ["schema"],
			getOutputPath(doc) {
				return doc.path;
			},
		});
	});
