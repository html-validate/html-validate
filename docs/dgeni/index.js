const path = require("canonical-path");
const Package = require("dgeni").Package;

const packagePath = __dirname;

module.exports = new Package("html-validate-docs", [
	require("dgeni-packages/links"),
	require("dgeni-front-matter"),
	require("./bootstrap"),
	require("./example"),
	require("./highlight"),
	require("./inline-validate"),
	require("./marked"),
	require("./schema"),
])

	.processor(require("./processors/rules"))

	.config(function (renderDocsProcessor) {
		renderDocsProcessor.extraData.pkg = require("../../package.json");
		renderDocsProcessor.extraData.tracking = process.env.GA_TRACKING_ID;
	})

	/* configure markdown syntax highlighting */
	.config(function (highlight) {
		highlight.configure({
			languages: ["js", "json", "typescript", "html", "shell"],
		});
		highlight.registerAliases("jsonc", { languageName: "json" });
	})

	/* configure examples output directory */
	.config(function (generateExamplesCodeProcessor) {
		generateExamplesCodeProcessor.outDir = path.join(__dirname, "../examples");
	})

	.factory(require("./changelog"))
	.factory(require("./migration"))

	.config(function (readFilesProcessor, changelogFileReader, migrationFileReader) {
		readFilesProcessor.fileReaders.push(changelogFileReader);
		readFilesProcessor.fileReaders.push(migrationFileReader);
	})

	.config(function (getLinkInfo) {
		getLinkInfo.relativeLinks = true;
	})

	.config(function (log, readFilesProcessor, writeFilesProcessor, copySchema) {
		log.level = "info";

		readFilesProcessor.basePath = path.resolve(packagePath, "../..");
		readFilesProcessor.sourceFiles = [
			{
				include: "docs/**/*.md",
				exclude: ["docs/dgeni/**/*.md", "docs/examples/**.md"],
				basePath: "docs",
				fileReader: "frontMatterFileReader",
			},
			{
				include: "CHANGELOG.md",
				basePath: ".",
				fileReader: "changelogFileReader",
			},
			{
				include: "MIGRATION.md",
				basePath: ".",
				fileReader: "migrationFileReader",
			},
		];

		copySchema.outputFolder = "schemas";
		copySchema.files = ["src/schema/elements.json", "src/schema/config.json"];

		writeFilesProcessor.outputFolder = "public";
	})

	.config(function (parseTagsProcessor, getInjectables) {
		parseTagsProcessor.tagDefinitions = parseTagsProcessor.tagDefinitions.concat(
			getInjectables(require("./tag-defs"))
		);
	})

	/* add custom nunjuck filters */
	.config(function (templateEngine) {
		templateEngine.filters = templateEngine.filters.concat(require("./filters"));
	})

	/* add the local template folder first in the search path so it overrides
	 * dgeni-packages bundled templates */
	.config(function (templateFinder) {
		templateFinder.templateFolders.unshift(path.resolve(packagePath, "templates"));
	})

	.config(function (computePathsProcessor, computeIdsProcessor) {
		computeIdsProcessor.idTemplates.push({
			docTypes: ["content", "frontpage", "rule", "rules", "presets", "error"],
			getId: function (doc) {
				const dir = path.dirname(doc.fileInfo.relativePath);
				if (dir === ".") {
					/* documents not in a subdirectory gets basename as id */
					return doc.fileInfo.baseName;
				}
				const name = doc.fileInfo.baseName;
				if (name !== "index") {
					/* documents in subdirectory gets dir + name as id, unless .. */
					return `${dir}/${name}`;
				} else {
					/* ... the name is index in which case only the directory is used */
					return dir;
				}
			},
			getAliases: function (doc) {
				const alias = [doc.id];
				if (doc.name) {
					alias.push(doc.name);
					alias.push(`${doc.docType}:${doc.name}`);
				}
				return alias;
			},
		});

		computePathsProcessor.pathTemplates.push({
			docTypes: ["content", "frontpage", "rule", "rules", "presets"],
			getPath: function (doc) {
				const dirname = path.dirname(doc.fileInfo.relativePath);
				const p = path.join(dirname, doc.fileInfo.baseName);
				return `${p}.html`;
			},
			outputPathTemplate: "${path}",
		});

		computeIdsProcessor.idTemplates.push({
			docTypes: ["changelog", "migration"],
			getId: function (doc) {
				return doc.fileInfo.baseName.toLowerCase();
			},
			getAliases: function (doc) {
				return [doc.id];
			},
		});

		computePathsProcessor.pathTemplates.push({
			docTypes: ["changelog", "migration"],
			getPath: function (doc) {
				const dirname = path.dirname(doc.fileInfo.relativePath);
				return path.join(dirname, doc.fileInfo.baseName.toLowerCase(), "index.html");
			},
			outputPathTemplate: "${path.toLowerCase()}",
		});

		computePathsProcessor.pathTemplates.push({
			docTypes: ["error"],
			getPath: function (doc) {
				/* should go directly under output directory, no subdirectory */
				return doc.fileInfo.baseName;
			},
			outputPathTemplate: "${path}.html",
		});
	})

	.config(function (checkAnchorLinksProcessor) {
		checkAnchorLinksProcessor.ignoredLinks.push(/^\/$/);
		checkAnchorLinksProcessor.ignoredLinks.push(/^\/changelog$/);
		checkAnchorLinksProcessor.checkDoc = (doc) => {
			return (
				doc.path && doc.outputPath && [".html", ".json"].includes(path.extname(doc.outputPath))
			);
		};
	});
