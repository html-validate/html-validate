import Dgeni from "dgeni";
import basePackage from "../base/index.mjs";
import extractTagsProcessor from "./processors/extract-tags.mjs";
import inlineTagsProcessor from "./processors/inline-tags.mjs";
import parseTagsProcessor from "./processors/parse-tags.mjs";
import backTickParserAdapter from "./services/parser-adapters/backtick-parser-adapter.mjs";
import htmlBlockParserAdapter from "./services/parser-adapters/html-block-parser-adapter.mjs";
import tagDefs from "./tag-defs/index.mjs";

const { Package } = Dgeni;

/**
 * @dgPackage jsdoc
 * @description Tag parsing and extracting for JSDoc-based documentation
 */
export default new Package("jsdoc", [basePackage])

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
	.processor(parseTagsProcessor)
	.processor(extractTagsProcessor)
	.processor(inlineTagsProcessor)

	.factory(backTickParserAdapter)
	.factory(htmlBlockParserAdapter)

	// Configure the processors
	.config(function (parseTagsProcessor, getInjectables) {
		parseTagsProcessor.tagDefinitions = getInjectables(tagDefs);
	});
