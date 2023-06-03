const { marked } = require("marked");
const { heading } = require("../plugins");

function removePreamble(code) {
	return code.replace(/[^]*\/\* --- \*\/\n+/gm, "");
}

function stripEslintComments(code) {
	return code.replace(/\/\* eslint-disable.*\n/g, "");
}

/**
 * Customized version of dgeni nunjucks renderer with highlighting support
 *
 * @param {import("../../example/services/example").Example} example
 */
module.exports = function renderMarkdown(example, trimIndentation, highlight) {
	/**
	 * @param {string} code
	 * @param {string} infostring
	 * @param {boolean} _escaped
	 * @returns {string}
	 */
	function code(code, infostring, _escaped) {
		example.compile(code, infostring);

		const lang = (infostring || "").match(/\S*/)[0];
		const processedCode = stripEslintComments(removePreamble(trimIndentation(code)));
		let renderedCode = highlight(processedCode, lang);

		// Bug in marked - forgets to add a final newline sometimes
		if (!/\n$/.test(renderedCode)) {
			renderedCode += "\n";
		}

		const classes = ["hljs"];
		if (lang) {
			classes.push(`language-${lang}`);
		}

		return `<pre><code class="${classes.join(" ")}">${renderedCode}</code></pre>`;
	}

	/* disable unused deprecated features */
	marked.use({
		mangle: false,
		highlight: false,
		headerIds: false,
	});

	/* enable custom render functions */
	marked.use(heading());
	marked.use({
		renderer: {
			code,
		},
	});

	return function render(content) {
		return marked(content);
	};
};
