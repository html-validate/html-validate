import kleur from "kleur";
import { HtmlValidate, formatterFactory } from "../../../../dist/esm/index.js";

const codeframe = formatterFactory("codeframe");

const formatterOptions = {
	showLink: false,
};

/**
 * @param {Map<string, unknown>} validateMap
 */
export default function generateValidationResultsProcessor(log, validateMap) {
	return {
		name: "generateValidationResultsProcessor",
		$runAfter: ["adding-extra-docs"],
		$runBefore: ["extra-docs-added"],
		$process,
	};

	function $process() {
		const previousEnabled = kleur.enabled;
		kleur.enabled = false;
		for (const validation of validateMap.values()) {
			const htmlvalidate = new HtmlValidate(validation.config);
			validation.report = htmlvalidate.validateStringSync(validation.markup);
			validation.codeframe = codeframe(validation.report.results, formatterOptions);

			if (validation.showResults === "auto") {
				validation.showResults = !validation.report.valid;
			}
		}
		kleur.enabled = previousEnabled;
	}
}
