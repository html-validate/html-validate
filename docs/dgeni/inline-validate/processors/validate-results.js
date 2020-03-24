const chalk = require("chalk");
const HtmlValidate = require("../../../../build/htmlvalidate").default;
const codeframe = require("../../../../build/formatters/codeframe");

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
		validateMap.forEach((validation) => {
			htmlvalidate = new HtmlValidate(validation.config);
			validation.report = htmlvalidate.validateString(validation.markup);
			validation.codeframe = codeframe(validation.report.results);

			if (validation.showResults === "auto") {
				validation.showResults = !validation.report.valid;
			}
		});
		chalk.level = oldLevel;
	}
};
