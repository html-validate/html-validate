/**
 * @param {string} value
 * @returns {boolean}
 */
function isVersionNumber(value) {
	return Boolean(/^\d+\.\d+\.\d+(-rc\.\d+)? \(\d+-\d+-\d+\)$/.test(value));
}

/**
 * @param {string} value
 * @returns {string}
 */
function generateId(value) {
	const slug = value
		.toLowerCase()
		.replaceAll(/\(.*?\)/g, "")
		.replaceAll(/\W+/g, "-")
		.replaceAll(/(^-|-$)/g, "");

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
	const hasId = /(?: +|^){#([a-z][\w-]*)}(?: +|$)/i;
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
				const parsed = this.parser.parseInline(tokens, this.parser.textRenderer);
				const raw = parsed.replaceAll(/<([!/a-z].*?)>/gi, "$1");
				const text = this.parser.parseInline(tokens);
				return heading(text, depth, raw);
			},
		},
	};
}

export { heading, plugin };
