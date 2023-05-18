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

	/**
	 * Add § link to all headings.
	 *
	 * @param {string} text
	 * @param {number} level
	 * @param {string} rawId
	 * @param {import("marked").Slugger}  _slugger
	 */
	function heading(text, level, raw, _slugger) {
		const id = `${this.options.headerPrefix}${generateId(raw)}`;
		const anchor = level > 1 ? `<a class="anchorlink" href="#${id}" aria-hidden="true"></a>` : "";
		return `<h${level} id="${id}">${text}${anchor}</h${level}>`;
	}

	/* disable unused deprecated features */
	marked.use({
		mangle: false,
		highlight: false,
		headerIds: false,
	});

	/* enable custom render functions */
	marked.use({
		renderer: {
			code,
			heading,
		},
	});

	return function render(content) {
		return marked(content);
	};
};
