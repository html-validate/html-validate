const { marked } = require("marked");

/**
 * @param {string} value
 * @returns {boolean}
 */
function isVersionNumber(value) {
	return Boolean(value.match(/^\d+\.\d+\.\d+ \(\d+-\d+-\d+\)$/));
}

/**
 * @param {string} value
 * @returns {string}
 */
function generateId(value) {
	const slug = value
		.toLowerCase()
		.replace(/\(.*?\)/g, "")
		.replace(/[^\w]+/g, "-")
		.replace(/(^-|-$)/g, "");

	if (isVersionNumber(value)) {
		return `v${slug}`;
	}

	return slug;
}

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
module.exports = function renderMarkdown(example, trimIndentation) {
	/**
	 * @param {string} code
	 * @param {string} infostring
	 * @param {boolean} escaped
	 * @returns {string}
	 */
	function code(code, infostring, escaped) {
		example.compile(code, infostring);

		const processedCode = stripEslintComments(removePreamble(trimIndentation(code)));
		let renderedCode = marked.Renderer.prototype.code.call(
			this,
			processedCode,
			infostring,
			escaped
		);

		// Bug in marked - forgets to add a final newline sometimes
		if (!/\n$/.test(renderedCode)) {
			renderedCode += "\n";
		}

		// Add hljs class
		renderedCode = renderedCode.replace(/<code(?: class="(.*?)")?>/, (_, classes) => {
			if (classes) {
				return `<code class="hljs ${classes}">`;
			} else {
				return `<code class="hljs">`;
			}
		});

		return renderedCode;
	}

	const renderer = new marked.Renderer();

	renderer.code = code;

	// Add § link to all headings
	renderer.heading = function (text, level, raw) {
		const id = `${this.options.headerPrefix}${generateId(raw)}`;
		const anchor = level > 1 ? `<a class="anchorlink" href="#${id}" aria-hidden="true"></a>` : "";
		return `<h${level} id="${id}">${text}${anchor}</h${level}>`;
	};

	const render = function (content) {
		return marked(content, {
			highlight: render.highlight,
			renderer,
		});
	};

	render.highlight = null; /* default */

	return render;
};
