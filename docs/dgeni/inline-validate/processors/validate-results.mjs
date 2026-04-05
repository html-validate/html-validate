import { createRequire } from "node:module";
import { HtmlValidate, formatterFactory } from "../../../../dist/cjs/index.js";

/* Use createRequire so we get the same CJS module-cache instance of kleur that
   dist/cjs/index.js uses internally. Setting kleur.enabled = false on an ESM
   wrapper would be a different object and would have no effect on the formatter. */
const _require = createRequire(import.meta.url);
const kleur = _require("kleur");

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
