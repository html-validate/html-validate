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
 * @param {import("marked").Slugger}  _slugger
 * @returns {string | false}
 */
function heading(text, level, raw, _slugger) {
	const [value, id] = getHeadingId(text, raw);
	if (level > 1) {
		return `<h${level} id="${id}"><a href="#${id}">${value}</a></h${level}>`;
	} else {
		return `<h${level} id="${id}">${value}</h${level}>`;
	}
}

/* istanbul ignore next -- not to be tested */
function plugin() {
	return {
		renderer: {
			heading,
		},
	};
}

module.exports = { heading, plugin };
