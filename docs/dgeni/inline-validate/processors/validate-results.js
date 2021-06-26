const kleur = require("kleur");
const { HtmlValidate, formatterFactory } = require("../../../../dist/cjs");

const codeframe = formatterFactory("codeframe");

const formatterOptions = {
	showLink: false,
};

module.exports = function generateValidationResultsProcessor(log, validateMap) {
	return {
		name: "generateValidationResultsProcessor",
		$runAfter: ["adding-extra-docs"],
		$runBefore: ["extra-docs-added"],
		$process,
	};

	function $process() {
		const previousEnabled = kleur.enabled;
		kleur.enabled = false;
		validateMap.forEach((validation) => {
			htmlvalidate = new HtmlValidate(validation.config);
			validation.report = htmlvalidate.validateString(validation.markup);
			validation.codeframe = codeframe(validation.report.results, formatterOptions);

			if (validation.showResults === "auto") {
				validation.showResults = !validation.report.valid;
			}
		});
		kleur.enabled = previousEnabled;
	}
};
