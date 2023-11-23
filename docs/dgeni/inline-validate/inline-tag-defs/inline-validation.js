/**
 * @param {Map<string, unknown>} validateMap
 */
module.exports = function inlineValidationInlineTagDef(validateMap, createDocMessage) {
	return {
		name: "inlineValidation",
		handler,
	};

	function handler(doc, tagName, description) {
		const validation = validateMap.get(description);
		if (!validation) {
			throw new Error(
				createDocMessage(`No inline validation exists with id "${description}".`, doc),
			);
		}
		if (!validation.inlineValidationDoc) {
			throw new Error(
				createDocMessage(
					`Validation "${description}" does not have an associated inlineValidationDoc. Are you missing a processor (validations-generate)?"`,
					doc,
				),
			);
		}
		return validation.inlineValidationDoc.renderedContent;
	}
};
