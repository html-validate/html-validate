const path = require("canonical-path");
const Package = require("dgeni").Package;
const packagePath = __dirname;

module.exports = new Package("html-validate-docs", [
	require("dgeni-packages/ngdoc"),
	require("dgeni-packages/nunjucks"),
	require("./inline-validate"),
])

	.processor(require("./processors/rules"))

	.config(function(renderDocsProcessor) {
		renderDocsProcessor.extraData.pkg = require("../../package.json");
		renderDocsProcessor.extraData.tracking = process.env.GA_TRACKING_ID;
	})

	.factory(require("./changelog"))

	.config(function(readFilesProcessor, changelogFileReader) {
		readFilesProcessor.fileReaders.push(changelogFileReader);
	})

	.config(function(log, readFilesProcessor, templateFinder, writeFilesProcessor) {
		log.level = "info";

		readFilesProcessor.basePath = path.resolve(packagePath, "../..");
		readFilesProcessor.sourceFiles = [
			{
				include: "docs/**/*.md",
				basePath: "docs",
				fileReader: "ngdocFileReader",
			},
			{
				include: "CHANGELOG.md",
				basePath: ".",
				fileReader: "changelogFileReader",
			},
		];

		writeFilesProcessor.outputFolder = "public";
	})

	.config(function(parseTagsProcessor, getInjectables) {
		parseTagsProcessor.tagDefinitions =
			parseTagsProcessor.tagDefinitions.concat(getInjectables(require("./tag-defs")));
	})

	/* add custom nunjuck filters */
	.config(function(templateEngine) {
		templateEngine.filters = templateEngine.filters.concat(require("./filters"));
	})

	/* add the local template folder first in the search path so it overrides
	 * dgeni-packages bundled templates */
	.config(function(templateFinder) {
		templateFinder.templateFolders.unshift(path.resolve(packagePath, "templates"));
	})

	.config(function(computePathsProcessor, computeIdsProcessor) {
		computeIdsProcessor.idTemplates.push({
			docTypes: ["content", "frontpage", "rules", "changelog"],
			getId: function(doc) { return doc.fileInfo.baseName; },
			getAliases: function(doc) { return [doc.id]; },
		});

		computePathsProcessor.pathTemplates.push({
			docTypes: ["content", "frontpage", "rules"],
			getPath: function(doc) {
				const dirname = path.dirname(doc.fileInfo.relativePath);
				return path.join(dirname, doc.fileInfo.baseName);
			},
			outputPathTemplate: "${path}.html",
		});

		computePathsProcessor.pathTemplates.push({
			docTypes: ["changelog"],
			getPath: function(doc) {
				const dirname = path.dirname(doc.fileInfo.relativePath);
				return path.join(dirname, doc.fileInfo.baseName);
			},
			outputPathTemplate: "${path.toLowerCase()}/index.html",
		});
	})

	.config(function(checkAnchorLinksProcessor) {
		checkAnchorLinksProcessor.ignoredLinks.push(/^\/$/);
		checkAnchorLinksProcessor.ignoredLinks.push(/^\/changelog$/);
	})

;
