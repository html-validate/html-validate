const { marked } = require("marked");
const { code, heading } = require("../plugins");

/**
 * Customized version of dgeni nunjucks renderer with highlighting support
 *
 * @param {import("../../example/services/example").Example} example
 */
module.exports = function renderMarkdown(example, highlight) {
	/* disable unused deprecated features */
	marked.use({
		mangle: false,
		highlight: false,
		headerIds: false,
	});

	/* enable custom render functions */
	marked.use(heading());
	marked.use(code({ example, highlight }));

	return function render(content) {
		return marked(content);
	};
};
