import Dgeni from "dgeni";
import basePackage from "../base/index.mjs";
import markedNunjucksFilter from "./rendering/filters/marked.mjs";
import nunjucksTemplateEngine from "./services/nunjucks-template-engine.mjs";

const { Package } = Dgeni;

/**
 * @dgPackage nunjucks
 * @description Provides a template engine powered by Nunjucks
 */
/* eslint-disable-next-line unicorn/no-top-level-side-effects -- false positive */
export default new Package("nunjucks", [basePackage])

	.factory(nunjucksTemplateEngine)
	.factory(markedNunjucksFilter)

	.config(function (templateEngine, markedNunjucksFilter) {
		templateEngine.filters = templateEngine.filters.concat([markedNunjucksFilter]);
	});
