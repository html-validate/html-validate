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
 * Add § link to all headings.
 *
 * @param {string} text
 * @param {number} level
 * @param {string} rawId
 * @param {import("marked").Slugger}  _slugger
 * @returns {string | false}
 */
function heading(text, level, raw, _slugger) {
	const id = `${this.options.headerPrefix}${generateId(raw)}`;
	const anchor = level > 1 ? `<a class="anchorlink" href="#${id}" aria-hidden="true"></a>` : "";
	return `<h${level} id="${id}">${text}${anchor}</h${level}>`;
}

function plugin() {
	return {
		renderer: {
			heading,
		},
	};
}

module.exports = { heading, plugin };
