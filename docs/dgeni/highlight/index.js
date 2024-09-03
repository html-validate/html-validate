const { Package } = require("dgeni");

module.exports = new Package("highlight", [require("../packages/nunjucks")])
	.factory(require("./services/highlight"))
	.factory(require("./filters/highlight"))
	.config(function (templateEngine, highlightFilter) {
		templateEngine.filters.push(highlightFilter);
	});
