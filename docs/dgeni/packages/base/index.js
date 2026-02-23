const Package = require("dgeni").Package;

// Define the `base` package
/**
 * @dgPackage base
 * @description Defines minimal set of processors to get started with Dgeni
 */
module.exports = new Package("base")

	// A set of pseudo processors that act as markers to help position real processors at the right
	// place in the pipeline
	/**
	 * @dgProcessor reading-files
	 * @description  A marker that files are about to be read
	 */
	.processor({ name: "reading-files" })
	/**
	 * @dgProcessor files-read
	 * @description A marker that files have just been read
	 */
	.processor({ name: "files-read", $runAfter: ["reading-files"] })
	/**
	 * @dgProcessor processing-docs
	 * @description A marker that we are about to start processing the docs
	 */
	.processor({ name: "processing-docs", $runAfter: ["files-read"] })
	/**
	 * @dgProcessor docs-processed
	 * @description A marker that the docs have just been processed
	 */
	.processor({ name: "docs-processed", $runAfter: ["processing-docs"] })
	/**
	 * @dgProcessor adding-extra-docs
	 * @description A marker that we are about to start adding extra docs
	 */
	.processor({ name: "adding-extra-docs", $runAfter: ["docs-processed"] })
	/**
	 * @dgProcessor extra-docs-added
	 * @description A marker that any extra docs have been added
	 */
	.processor({ name: "extra-docs-added", $runAfter: ["adding-extra-docs"] })
	/**
	 * @dgProcessor computing-ids
	 * @description A marker that we are about to start computing the ids of the docs
	 */
	.processor({ name: "computing-ids", $runAfter: ["extra-docs-added"] })
	/**
	 * @dgProcessor ids-computed
	 * @description A marker that the doc ids have just been computed
	 */
	.processor({ name: "ids-computed", $runAfter: ["computing-ids"] })
	/**
	 * @dgProcessor computing-paths
	 * @description A marker that we are about to start computing the paths of the docs
	 */
	.processor({ name: "computing-paths", $runAfter: ["ids-computed"] })
	/**
	 * @dgProcessor paths-computed
	 * @description A marker that the doc paths have just been computed
	 */
	.processor({ name: "paths-computed", $runAfter: ["computing-paths"] })
	/**
	 * @dgProcessor rendering-docs
	 * @description A marker that we are about to start generating the rendered content
	 * for the docs
	 */
	.processor({ name: "rendering-docs", $runAfter: ["paths-computed"] })
	/**
	 * @dgProcessor docs-rendered
	 * @description A marker that the rendered content has been generated
	 */
	.processor({ name: "docs-rendered", $runAfter: ["rendering-docs"] })
	/**
	 * @dgProcessor writing-files
	 * @description A marker that we are about to start writing the docs to files
	 */
	.processor({ name: "writing-files", $runAfter: ["docs-rendered"] })
	/**
	 * @dgProcessor files-written
	 * @description A marker that the docs have been written to files
	 */
	.processor({ name: "files-written", $runAfter: ["writing-files"] })

	// Real processors for this package
	.processor(require("./processors/read-files"))
	.processor(require("./processors/render-docs"))
	.processor(require("./processors/unescape-comments"))
	.processor(require("./processors/write-files"))
	.processor(require("./processors/debug-dump-processor"))
	.processor(require("./processors/compute-ids"))
	.processor(require("./processors/compute-paths"))
	.processor(require("./processors/check-anchor-links"))

	// Helper services
	.factory(require("./services/resolve-url"))
	.factory(require("./services/extract-links"))
	.factory(require("./services/template-finder"))
	.factory(require("./services/encode-code-block"))
	.factory(require("./services/trim-indentation"))
	.factory(require("./services/alias-map"))
	.factory(require("./services/create-doc-message"))
	.factory(require("./services/write-file"));
