const Package = require("dgeni").Package;

/**
 * @dgPackage nunjucks
 * @description Provides a template engine powered by Nunjucks
 */
module.exports = new Package("nunjucks", [require("../base")])

	.factory(require("./services/nunjucks-template-engine"))
	.factory(require("./rendering/filters/marked"))

	.config(function (templateEngine, markedNunjucksFilter) {
		templateEngine.filters = templateEngine.filters.concat([markedNunjucksFilter]);
	});
