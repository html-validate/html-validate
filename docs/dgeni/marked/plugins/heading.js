const unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi;

/*  */

/**
 * Copy of marked helper.
 *
 * https://github.com/markedjs/marked/issues/1650#issuecomment-617429229
 *
 * @param {string} html
 * @returns {string}
 */
function unescape(html) {
	// explicitly match decimal, hex, and named HTML entities
	return html.replace(unescapeTest, (_, n) => {
		n = n.toLowerCase();
		if (n === "colon") return ":";
		if (n.charAt(0) === "#") {
			return n.charAt(1) === "x"
				? String.fromCharCode(parseInt(n.substring(2), 16))
				: String.fromCharCode(+n.substring(1));
		}
		return "";
	});
}

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

/**
 * @param {string} text
 * @param {string} rawId
 * @returns {[text: string, id: string]}
 */
function getHeadingId(text, raw) {
	const hasId = /(?: +|^)\{#([a-z][\w-]*)\}(?: +|$)/i;
	const match = text.match(hasId);
	if (match) {
		return [text.replace(hasId, ""), match[1]];
	} else {
		return [text, generateId(raw)];
	}
}

/**
 * Add § link to all headings.
 *
 * @param {string} text
 * @param {number} level
 * @param {string} rawId
 * @returns {string | false}
 */
function heading(text, level, raw) {
	const [value, id] = getHeadingId(text, raw);
	if (level > 1) {
		return `<h${level} id="${id}"><a href="#${id}">${value}</a></h${level}>`;
	} else {
		return `<h${level} id="${id}">${value}</h${level}>`;
	}
}

/**
 * @returns {import("marked").MarkedExtension} context
 */
/* istanbul ignore next -- not to be tested */
function plugin() {
	return {
		renderer: {
			heading({ depth, tokens }) {
				const raw = unescape(this.parser.parseInline(tokens, this.parser.textRenderer))
					.trim()
					.replace(/<[!/a-z].*?>/gi, "");
				const text = this.parser.parseInline(tokens);
				return heading(text, depth, raw);
			},
		},
	};
}

module.exports = { heading, plugin };
