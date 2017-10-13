const path = require('canonical-path');
const Package = require('dgeni').Package;
const packagePath = __dirname;

module.exports = new Package('cma-docs', [
	require('dgeni-packages/ngdoc'),
	require('dgeni-packages/nunjucks'),
])

	.config(function(log, readFilesProcessor, templateFinder, writeFilesProcessor) {
		log.level = 'info';

		readFilesProcessor.basePath = path.resolve(packagePath, '../..');
		readFilesProcessor.sourceFiles = [
			{
				include: 'docs/**/*.md',
				basePath: 'docs',
				fileReader: 'ngdocFileReader',
			},
		];

		writeFilesProcessor.outputFolder = 'public';
	})

	/* add the local template folder first in the search path so it overrides
	 * dgeni-packages bundled templates */
	.config(function(templateFinder) {
		templateFinder.templateFolders.unshift(path.resolve(packagePath, 'templates'));
	})

	.config(function(computePathsProcessor, computeIdsProcessor) {
		computeIdsProcessor.idTemplates.push({
			docTypes: ['content', 'frontpage'],
			getId: function(doc) { return doc.fileInfo.baseName; },
			getAliases: function(doc) { return [doc.id]; },
		});

		computePathsProcessor.pathTemplates.push({
			docTypes: ['content', 'frontpage'],
			getPath: function(doc) {
				const dirname = path.dirname(doc.fileInfo.relativePath);
				return path.join(dirname, doc.fileInfo.baseName);
			},
			outputPathTemplate: '${path}.html',
		});
	})

	.config(function(checkAnchorLinksProcessor) {
		checkAnchorLinksProcessor.ignoredLinks.push(/^\/$/);
	})

;
