const Package = require("dgeni").Package;

module.exports = new Package("highlight", [require("dgeni-packages/nunjucks")])

	/* override markdown renderer from dgeni nunjucks package to allow setting a
	 * highlighter */
	.factory(require("./services/renderMarkdown"))
	.factory(require("./services/highlight"))
	.factory(require("./filters/highlight"))

	/* enable syntax highlighting */
	.config(function (renderMarkdown, highlight) {
		renderMarkdown.highlight = highlight;
	})

	/* add highlight filter */
	.config(function (templateEngine, highlightFilter) {
		templateEngine.filters.push(highlightFilter);
	});
