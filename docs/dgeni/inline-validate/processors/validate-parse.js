const path = require("path");

const VALIDATE_REGEX = /<validate([^>]*)>([\S\s]+?)<\/validate>/g;
const ATTRIBUTE_REGEX = /\s*([^=]+)\s*=\s*(?:(?:"([^"]+)")|(?:'([^']+)'))/g;

module.exports = function parseValidatesProcessor(
	log,
	validateMap,
	trimIndentation,
	createDocMessage
) {
	return {
		$runAfter: ["files-read"],
		$runBefore: ["parsing-tags"],
		$process,
	};

	function $process(docs) {
		docs.forEach(doc => {
			try {
				if (!doc.content) {
					return;
				}

				doc.content = doc.content.replace(
					VALIDATE_REGEX,
					function processValidate(match, attributeText, validateMarkup) {
						const attr = extractAttributes(attributeText);
						if (!attr.name) {
							throw new Error(
								createDocMessage("Inline validation is missing name", doc)
							);
						}

						const name = attr.name;
						const rules = attr.rules ? attr.rules.split(/ +/) : undefined;
						const elements = readElements(doc.fileInfo, attr.elements);
						const id = uniqueName(validateMap, `markup-${attr.name}`);
						const markup = trimIndentation(validateMarkup);
						const config = generateConfig(rules, elements, attr);

						const validate = {
							config,
							name,
							markup,
							id,
							doc,
						};

						// store the validate information for later
						log.debug("Storing inline validation", id);
						validateMap.set(id, validate);

						return `{@inlineValidation ${id}}`;
					}
				);
			} catch (error) {
				throw new Error(
					createDocMessage("Failed to parse inline validation", doc, error)
				);
			}
		});
	}

	function readElements(fileInfo, filename) {
		if (!filename) return filename;
		const dir = path.dirname(fileInfo.filePath);
		return require(`${dir}/${filename}`);
	}

	function extractAttributes(attributeText) {
		const attributes = {};
		attributeText.replace(ATTRIBUTE_REGEX, function(match, prop, val1, val2) {
			attributes[prop] = val1 || val2;
		});
		return attributes;
	}

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
		attr = Object.assign({}, attr); /* copy before modification */
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
};
