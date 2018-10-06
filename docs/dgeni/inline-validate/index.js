const path = require('canonical-path');
const packagePath = __dirname;
const Package = require('dgeni').Package;

module.exports = new Package('inline-validate', [])

	.processor(require('./processors/validate-parse'))
	.processor(require('./processors/validate-generate'))
	.processor(require('./processors/validate-results'))
	.processor(require('./processors/validate-generate-spec'))

	.factory(require('./services/validateMap'))
	.factory(require('./inline-tag-defs/inline-validation'))

	.config(function(templateFinder) {
		templateFinder.templateFolders.push(path.resolve(packagePath, 'templates'));
	})

	.config(function(inlineTagProcessor, inlineValidationInlineTagDef) {
		inlineTagProcessor.inlineTagDefinitions.push(inlineValidationInlineTagDef);
	})

	.config(function(computePathsProcessor, computeIdsProcessor) {
		computePathsProcessor.pathTemplates.push({
			docTypes: ['validate-config', 'validate-markup'],
			getPath: function() {},
			outputPathTemplate: 'inline-validations/${id}',
		});
		computePathsProcessor.pathTemplates.push({
			docTypes: ['validate-spec'],
			getPath: function() {},
			outputPathTemplate: '../docs/${id}',
		});
		computePathsProcessor.pathTemplates.push({
			docTypes: ['inlineValidation'],
			pathTemplate: 'inline-validations/${validate.id}',
			getOutputPath: function() {},
		});
		computeIdsProcessor.idTemplates.push({
			docTypes: ['validate-config', 'validate-markup', 'validate-spec', 'inlineValidation'],
			getAliases: function(doc) { return [doc.id]; },
		});
	});
