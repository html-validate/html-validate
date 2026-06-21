import Dgeni from "dgeni";
import highlightPackage from "../highlight/index.mjs";
import nunjucksPackage from "../packages/nunjucks/index.mjs";
import renderMarkdown from "./services/render-markdown.mjs";

const { Package } = Dgeni;

const pkg = new Package("marked", [nunjucksPackage, highlightPackage])
	/* override markdown renderer from dgeni nunjucks package to allow setting a
	 * highlighter */
	/* eslint-disable-next-line unicorn/no-unreadable-new-expression -- established pattern for dgeni */
	.factory(renderMarkdown);

export default pkg;
