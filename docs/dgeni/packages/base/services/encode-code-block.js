const replacement = {
	"<": `&lt;`,
	">": `&gt;`,
	"&": `&amp;`,
	'"': `&quot;`,
	"'": `&apos;`,
};

/**
 * @param {string} str
 * @returns {string}
 */
function htmlEncode(str) {
	if (!str) {
		return "";
	}

	return str.replace(/[<>&"']/g, (m) => {
		return replacement[m];
	});
}

module.exports = function encodeCodeBlock() {
	return (str, inline, lang) => {
		// Encode any HTML entities in the code string
		str = htmlEncode(str);

		// If a language is provided then attach a CSS class to the code element
		lang = lang ? ` class="lang-${lang}"` : "";

		str = `<code${lang}>${str}</code>`;

		// If not inline then wrap the code element in a pre element
		if (!inline) {
			str = `<pre>${str}</pre>`;
		}

		return str;
	};
};
