import Dgeni from "dgeni";
import basePackage from "../base/index.mjs";
import markedNunjucksFilter from "./rendering/filters/marked.mjs";
import nunjucksTemplateEngine from "./services/nunjucks-template-engine.mjs";

const { Package } = Dgeni;

/**
 * @dgPackage nunjucks
 * @description Provides a template engine powered by Nunjucks
 */
export default new Package("nunjucks", [basePackage])

	/* eslint-disable-next-line unicorn/no-unreadable-new-expression -- established pattern for dgeni */
	.factory(nunjucksTemplateEngine)
	.factory(markedNunjucksFilter)

	.config(function (templateEngine, markedNunjucksFilter) {
		templateEngine.filters = templateEngine.filters.concat([markedNunjucksFilter]);
	});
