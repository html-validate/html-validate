import Dgeni from "dgeni";
import highlightPackage from "../highlight/index.mjs";
import nunjucksPackage from "../packages/nunjucks/index.mjs";
import renderMarkdown from "./services/render-markdown.mjs";

const { Package } = Dgeni;

const pkg = new Package("marked", [nunjucksPackage, highlightPackage]);
/* override markdown renderer from dgeni nunjucks package to allow setting a
 * highlighter */
pkg.factory(renderMarkdown);

export default pkg;
