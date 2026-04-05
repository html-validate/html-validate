import { marked } from "marked";
import { code, container, heading, ruleInfoPlugin } from "../plugins/index.mjs";

/**
 * Customized version of dgeni nunjucks renderer with highlighting support
 *
 * @param {import("../../example/services/example").Example} example
 */
export default function renderMarkdown(example, highlight) {
	/* enable custom render functions */
	marked.use(container());
	marked.use(heading());
	marked.use(code({ example, highlight }));
	marked.use(ruleInfoPlugin());

	return function render(content) {
		return marked(content);
	};
}
