const { marked } = require("marked");
const { code, heading, ruleInfoPlugin } = require("../plugins");

/**
 * Customized version of dgeni nunjucks renderer with highlighting support
 *
 * @param {import("../../example/services/example").Example} example
 */
module.exports = function renderMarkdown(example, highlight) {
	/* enable custom render functions */
	marked.use(heading());
	marked.use(code({ example, highlight }));
	marked.use(ruleInfoPlugin());

	return function render(content) {
		return marked(content);
	};
};
