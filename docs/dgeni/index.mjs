import canonicalPath from "canonical-path";
import Dgeni from "dgeni";
import dgeniMatter from "dgeni-front-matter";
import pkg from "../../package.json" with { type: "json" };
import changelog from "./changelog.mjs";
import examplePackage from "./example/index.mjs";
import filters from "./filters/index.mjs";
import highlightPackage from "./highlight/index.mjs";
import inlineTagDefs from "./inline-tag-defs/index.mjs";
import inlineValidatePackage from "./inline-validate/index.mjs";
import markedPackage from "./marked/index.mjs";
import migration from "./migration.mjs";
import navigationPackage from "./navigation/index.mjs";
import basePackage from "./packages/base/index.mjs";
import linksPackage from "./packages/links/index.mjs";
import fileManifest from "./processors/file-manifest.mjs";
import rules from "./processors/rules.mjs";
import schemaPackage from "./schema/index.mjs";
import tagDefs from "./tag-defs/index.mjs";

const { Package } = Dgeni;
const packagePath = import.meta.dirname;

export default new Package("html-validate-docs", [
	dgeniMatter,
	examplePackage,
	highlightPackage,
	inlineValidatePackage,
	markedPackage,
	navigationPackage,
	basePackage,
	linksPackage,
	schemaPackage,
])

	.processor(fileManifest)
	.processor(rules)

	.config(function (renderDocsProcessor) {
		renderDocsProcessor.extraData.pkg = pkg;
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
		generateExamplesCodeProcessor.outDir = canonicalPath.join(packagePath, "../examples");
	})

	.factory(changelog)
	.factory(migration)

	.config(function (readFilesProcessor, changelogFileReader, migrationFileReader) {
		readFilesProcessor.fileReaders.push(changelogFileReader);
		readFilesProcessor.fileReaders.push(migrationFileReader);
	})

	.config(function (getLinkInfo) {
		getLinkInfo.relativeLinks = true;
	})

	.config(
		function (log, fileManifestProcessor, readFilesProcessor, writeFilesProcessor, copySchema) {
			log.level = "info";

			readFilesProcessor.basePath = canonicalPath.resolve(packagePath, "../..");
			readFilesProcessor.sourceFiles = [
				{
					include: "docs/**/*.md",
					exclude: ["docs/dgeni/**/*.md", "docs/examples/**.md", "docs/node_modules/**/*.md"],
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

			fileManifestProcessor.manifestLocation = canonicalPath.resolve(
				packagePath,
				"../../etc/docs-manifest.md",
			);

			writeFilesProcessor.outputFolder = "public";
		},
	)

	.config(function (parseTagsProcessor, getInjectables) {
		parseTagsProcessor.tagDefinitions = parseTagsProcessor.tagDefinitions.concat(
			getInjectables(tagDefs),
		);
	})

	.config(function (inlineTagProcessor, getInjectables) {
		inlineTagProcessor.inlineTagDefinitions = inlineTagProcessor.inlineTagDefinitions.concat(
			getInjectables(inlineTagDefs),
		);
	})

	/* add custom nunjuck filters */
	.config(function (templateEngine) {
		templateEngine.filters = templateEngine.filters.concat(filters);
	})

	/* add the local template folder first in the search path so it overrides
	 * dgeni-packages bundled templates */
	.config(function (templateFinder) {
		templateFinder.templateFolders.unshift(canonicalPath.resolve(packagePath, "templates"));

		/* normally this is a list of lodash templates (set in dgeni-packages) but
		 * lodash templates are not supported here and replaced with arrow
		 * functions */
		templateFinder.templatePatterns = [
			(doc) => `${doc.template}`,
			(doc) => `${doc.id}.${doc.docType}.template.html`,
			(doc) => `${doc.id}.template.html`,
			(doc) => `${doc.docType}.template.html`,
		];
	})

	.config(function (computePathsProcessor, computeIdsProcessor) {
		computeIdsProcessor.idTemplates.push({
			docTypes: ["content", "frontpage", "rule", "rules", "presets", "error"],
			getId(doc) {
				const dir = canonicalPath.dirname(doc.fileInfo.relativePath);
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
			getAliases(doc) {
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
			getPath(doc) {
				const dirname = canonicalPath.dirname(doc.fileInfo.relativePath);
				const p = canonicalPath.join(dirname, doc.fileInfo.baseName);
				return `${p}.html`;
			},
			getOutputPath(doc) {
				return doc.path;
			},
		});

		computeIdsProcessor.idTemplates.push({
			docTypes: ["changelog", "migration"],
			getId(doc) {
				return doc.fileInfo.baseName.toLowerCase();
			},
			getAliases(doc) {
				return [doc.id];
			},
		});

		computePathsProcessor.pathTemplates.push({
			docTypes: ["changelog", "migration"],
			getPath(doc) {
				const dirname = canonicalPath.dirname(doc.fileInfo.relativePath);
				return canonicalPath.join(dirname, doc.fileInfo.baseName.toLowerCase(), "index.html");
			},
			getOutputPath(doc) {
				return doc.path.toLowerCase();
			},
		});

		computePathsProcessor.pathTemplates.push({
			docTypes: ["error"],
			getPath(doc) {
				/* should go directly under output directory, no subdirectory */
				return doc.fileInfo.baseName;
			},
			getOutputPath(doc) {
				return `${doc.path}.html`;
			},
		});
	})

	.config(function (checkAnchorLinksProcessor) {
		checkAnchorLinksProcessor.ignoredLinks.push(/^\/$/);
		checkAnchorLinksProcessor.ignoredLinks.push(/^\/changelog$/);
		checkAnchorLinksProcessor.checkDoc = (doc) => {
			return (
				doc.path &&
				doc.outputPath &&
				[".html", ".json"].includes(canonicalPath.extname(doc.outputPath))
			);
		};
	});
