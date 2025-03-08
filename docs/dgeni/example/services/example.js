const crypto = require("crypto");

/**
 * @typedef {object} ExampleDefinition
 * @property {"ts" | "js"} lang
 * @property {string} code
 * @property {boolean} fakeRequire
 */

/**
 * @typedef {object} Example
 * @property {(code: string, code: string) => void} compile
 * @property {[string, ExampleDefinition]} entries
 */

/**
 * @param {string} code
 * @returns {string}
 */
function generateCompilationId(code) {
	/* eslint-disable-next-line sonarjs/hashing -- technical debt, not used for anything sensitive but should probably use sha256 or similar instead */
	const hash = crypto.createHash("md5").update(code).digest("hex");
	return `example-${hash.slice(0, 6)}`;
}

/**
 * @param {string} lang
 * @returns {string | null}
 */
function isSupported(lang) {
	switch (lang) {
		case "ts":
		case "typescript":
			return "ts";
		case "js":
		case "javascript":
			return "js";
		default:
			return null;
	}
}

module.exports = function example() {
	const examples = new Map();

	return {
		compile(code, infostring) {
			const [declaredLang, ...tags] = (infostring || "").split(/\s+/);
			if (tags.includes("nocompile")) {
				return;
			}

			const lang = isSupported(declaredLang);
			if (!lang) {
				return;
			}

			const id = generateCompilationId(code);
			const fakeRequire = tags.includes("fake-require");
			examples.set(id, { lang, code, fakeRequire });
		},
		entries() {
			return examples.entries();
		},
	};
};
