const Package = require("dgeni").Package;

/**
 * @dgPackage links
 */
module.exports = new Package("links", [require("dgeni-packages/jsdoc")])

	.factory(require("./inline-tag-defs/link"))
	.factory(require("./services/getDocFromAlias"))
	.factory(require("./services/getLinkInfo"))

	.config(function (inlineTagProcessor, linkInlineTagDef) {
		inlineTagProcessor.inlineTagDefinitions.push(linkInlineTagDef);
	});
