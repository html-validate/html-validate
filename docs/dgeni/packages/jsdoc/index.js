const Package = require("dgeni").Package;

/**
 * @dgPackage jsdoc
 * @description Tag parsing and extracting for JSDoc-based documentation
 */
module.exports = new Package("jsdoc", [require("../base")])

	// Add in extra pseudo marker processors
	.processor({ name: "parsing-tags", $runAfter: ["files-read"], $runBefore: ["processing-docs"] })
	.processor({ name: "tags-parsed", $runAfter: ["parsing-tags"], $runBefore: ["processing-docs"] })
	.processor({
		name: "extracting-tags",
		$runAfter: ["tags-parsed"],
		$runBefore: ["processing-docs"],
	})
	.processor({
		name: "tags-extracted",
		$runAfter: ["extracting-tags"],
		$runBefore: ["processing-docs"],
	})

	// Add in the real processors for this package
	.processor(require("./processors/parse-tags"))
	.processor(require("./processors/extract-tags"))
	.processor(require("./processors/inline-tags"))

	.factory(require("./services/parser-adapters/backtick-parser-adapter"))
	.factory(require("./services/parser-adapters/html-block-parser-adapter"))

	// Configure the processors

	.config(function (parseTagsProcessor, getInjectables) {
		parseTagsProcessor.tagDefinitions = getInjectables(require("./tag-defs"));
	});
