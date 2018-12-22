const HtmlValidate = require("../../../../build/htmlvalidate").default;

module.exports = function generateValidationResultsProcessor(log, validateMap) {
	return {
		name: "generateValidationResultsProcessor",
		$runAfter: ["adding-extra-docs"],
		$runBefore: ["extra-docs-added"],
		$process,
	};

	function $process() {
		validateMap.forEach(validation => {
			htmlvalidate = new HtmlValidate(validation.config);
			validation.report = htmlvalidate.validateString(validation.markup);
		});
	}
};
