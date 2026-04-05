import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import path from "node:path";

const _require = createRequire(import.meta.url);

const VALIDATE_REGEX = /<validate([^>]*)>([\S\s]+?)<\/validate>/g;
const ATTRIBUTE_REGEX = /\s*([^=]+)\s*=\s*(?:(?:"([^"]+)")|(?:'([^']+)'))/g;

/**
 * @param {Map<string, unknown>} validateMap
 */
function parseValidatesProcessor(log, validateMap, trimIndentation, createDocMessage) {
	return {
		$runAfter: ["files-read"],
		$runBefore: ["parsing-tags"],
		$process,
	};

	function $process(docs) {
		for (const doc of docs) {
			try {
				if (!doc.content) {
					continue;
				}

				doc.content = doc.content.replaceAll(VALIDATE_REGEX, processValidate.bind(undefined, doc));
			} catch (error) {
				throw new Error(createDocMessage("Failed to parse inline validation", doc, error));
			}
		}
	}

	function processValidate(doc, match, attributeText, validateMarkup) {
		const attr = extractAttributes(attributeText);
		if (!attr.name) {
			throw new Error(createDocMessage("Inline validation is missing name", doc));
		}

		const name = attr.name;
		const rules = attr.rules ? attr.rules.split(/ +/) : undefined;
		const showResults = attr.results ? Boolean(attr.results) : "auto";
		const elements = readElements(doc.fileInfo, attr.elements);
		const id = uniqueName(validateMap, `markup-${attr.name}`);
		const markup = trimIndentation(validateMarkup);
		const config = generateConfig(rules, elements, attr);
		const fingerprint = getFingerprint([name, rules, elements, markup]);

		const validate = {
			config,
			name,
			markup,
			showResults,
			id,
			doc,
			fingerprint,
		};

		// store the validate information for later
		log.debug("Storing inline validation", id);
		validateMap.set(id, validate);

		return `{@inlineValidation ${id}}`;
	}

	function readElements(fileInfo, filename) {
		if (!filename) {
			return filename;
		}
		const dir = path.dirname(fileInfo.filePath);
		return _require(`${dir}/${filename}`);
	}

	function extractAttributes(attributeText) {
		const attributes = {};
		attributeText.replaceAll(ATTRIBUTE_REGEX, function (match, prop, val1, val2) {
			attributes[prop] = val1 || val2;
		});
		return attributes;
	}

	/**
	 * @param {Map<string, unknown>} containerMap
	 */
	function uniqueName(containerMap, name) {
		if (containerMap.has(name)) {
			let index = 1;
			while (containerMap.has(name + index)) {
				index += 1;
			}
			name = name + index;
		}
		return name;
	}

	function generateConfig(rules, elements, attr) {
		attr = { ...attr }; /* copy before modification */
		delete attr.elements;
		delete attr.name;
		delete attr.rules;
		const config = {};
		if (elements) {
			config.elements = ["html5", elements];
		}
		if (rules) {
			config.rules = rules.reduce((dst, rule) => {
				if (attr[rule]) {
					dst[rule] = ["error", JSON.parse(attr[rule])];
				} else {
					dst[rule] = "error";
				}
				return dst;
			}, {});
		} else {
			config.extends = ["html-validate:recommended"];
		}
		return config;
	}

	/**
	 * @param {string[]} data
	 * @returns {string}
	 */
	function getFingerprint(data) {
		const hash = createHash("sha512").update(data.join(":")).digest("hex");
		return hash.slice(0, 12);
	}
}

export default parseValidatesProcessor;
