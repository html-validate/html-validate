const HtmlValidate = require("../../../../build/htmlvalidate").default;
const codeframe = require("../../../../build/formatters/codeframe");
const chalk = require("chalk");

module.exports = function generateValidationResultsProcessor(log, validateMap) {
	return {
		name: "generateValidationResultsProcessor",
		$runAfter: ["adding-extra-docs"],
		$runBefore: ["extra-docs-added"],
		$process,
	};

	function $process() {
		const oldLevel = chalk.level;
		chalk.level = 0;
		validateMap.forEach(validation => {
			htmlvalidate = new HtmlValidate(validation.config);
			validation.report = htmlvalidate.validateString(validation.markup);
			validation.codeframe = codeframe(validation.report.results);
		});
		chalk.level = oldLevel;
	}
};
