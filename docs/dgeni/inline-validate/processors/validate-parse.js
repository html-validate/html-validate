const VALIDATE_REGEX = /<validate([^>]*)>([\S\s]+?)<\/validate>/g;
const ATTRIBUTE_REGEX = /\s*([^=]+)\s*=\s*(?:(?:"([^"]+)")|(?:'([^']+)'))/g;

module.exports = function parseValidatesProcessor(log, validateMap, trimIndentation, createDocMessage){
	return {
		$runAfter: ['files-read'],
		$runBefore: ['parsing-tags'],
		$process,
	};

	function $process(docs){
		docs.forEach(doc => {
			try {
				if (!doc.content) { return; }

				doc.content = doc.content.replace(VALIDATE_REGEX, function processValidate(match, attributeText, validateMarkup) {
					const attr = extractAttributes(attributeText);
					const rules = attr.rules.split(/ +/);
					const id = uniqueName(validateMap, 'markup');
					const markup = trimIndentation(validateMarkup);
					const config = generateConfig(rules);

					const validate = {
						config,
						markup,
						id,
						doc,
					};

					// store the validate information for later
					log.debug('Storing inline validation', id);
					validateMap.set(id, validate);

					return `{@inlineValidation ${id}}`;
				});
			} catch (error){
				throw new Error(createDocMessage('Failed to parse inline validation', doc, error));
			}
		});
	}

	function extractAttributes(attributeText){
		const attributes = {};
		attributeText.replace(ATTRIBUTE_REGEX, function(match, prop, val1, val2){
			attributes[prop] = val1 || val2;
		});
		return attributes;
	}

	function uniqueName(containerMap, name){
		if (containerMap.has(name)){
			let index = 1;
			while (containerMap.has(name + index)){
				index += 1;
			}
			name = name + index;
		}
		return name;
	}

	function generateConfig(rules){
		return {
			rules: rules.reduce((dst, rule) => {
				dst[rule] = 'error';
				return dst;
			}, {}),
		};
	}
};
