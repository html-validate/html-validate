const Package = require("dgeni").Package;

/**
 * @dgPackage links
 */
module.exports = new Package("links", [require("../jsdoc")])

	.factory(require("./inline-tag-defs/link"))
	.factory(require("./services/get-doc-from-alias"))
	.factory(require("./services/get-link-info"))

	.config(function (inlineTagProcessor, linkInlineTagDef) {
		inlineTagProcessor.inlineTagDefinitions.push(linkInlineTagDef);
	});
