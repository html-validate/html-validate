import Dgeni from "dgeni";
import nunjucksPackage from "../packages/nunjucks/index.mjs";
import highlightFilter from "./filters/highlight.mjs";
import highlightService from "./services/highlight.mjs";

const { Package } = Dgeni;

/* eslint-disable-next-line unicorn/no-top-level-side-effects -- false positive */
export default new Package("highlight", [nunjucksPackage])

	.factory(highlightService)
	.factory(highlightFilter)
	.config(function (templateEngine, highlightFilter) {
		templateEngine.filters.push(highlightFilter);
	});
