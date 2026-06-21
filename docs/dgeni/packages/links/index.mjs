import Dgeni from "dgeni";
import jsdocPackage from "../jsdoc/index.mjs";
import linkInlineTagDef from "./inline-tag-defs/link.mjs";
import getDocFromAlias from "./services/get-doc-from-alias.mjs";
import getLinkInfo from "./services/get-link-info.mjs";

const { Package } = Dgeni;

/**
 * @dgPackage links
 */
export default new Package("links", [jsdocPackage])

	.factory(linkInlineTagDef)
	.factory(getDocFromAlias)
	.factory(getLinkInfo)

	.config(function (inlineTagProcessor, linkInlineTagDef) {
		inlineTagProcessor.inlineTagDefinitions.push(linkInlineTagDef);
	});
