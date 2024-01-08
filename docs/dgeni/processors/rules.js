const { configPresets } = require("../../../dist/cjs");

/* sort order */
const availablePresets = ["recommended", "standard", "a11y", "document"];

function compareName(a, b) {
	if (a.name < b.name) {
		return -1;
	} else if (a.name > b.name) {
		return 1;
	} else {
		return 0;
	}
}

function isRuleDocument(doc) {
	return doc.docType === "rule" && !doc.hidden;
}

/**
 * @returns {boolean}
 */
function isEnabled(value) {
	if (!value || value === "off") {
		return false;
	}
	if (value === "warn" || value === "error") {
		return true;
	}
	if (Array.isArray(value)) {
		return isEnabled(value[0]);
	}
	throw new Error(`Don't know how to process "${value}"`);
}

module.exports = function rulesProcessor(renderDocsProcessor) {
	return {
		$runAfter: ["paths-computed"],
		$runBefore: ["rendering-docs"],
		$process: process,
	};

	function process(docs) {
		const ruleDocs = docs.filter(isRuleDocument);

		/* compule rule source paths */
		ruleDocs.forEach((doc) => {
			const docPath = doc.fileInfo.projectRelativePath;
			doc.ruleSourcePath = docPath.replace("docs", "src").replace(/\.md$/, ".ts");
		});

		/* generate title */
		ruleDocs.forEach((doc) => {
			if (!doc.title) {
				doc.title = `${doc.summary} (${doc.name})`;
			}
		});

		/* find all available rules */
		const rules = ruleDocs
			.map((doc) => ({
				name: doc.name,
				url: doc.outputPath,
				category: doc.category,
				summary: doc.summary,
				presets: availablePresets.reduce((result, presetName) => {
					const key = `html-validate:${presetName}`;
					const config = configPresets[key];
					if (config && config.rules) {
						result[presetName] = isEnabled(config.rules[doc.name]);
					}
					return result;
				}, {}),
			}))
			.sort(compareName);

		/* group rules into categories */
		const categories = { all: rules };
		rules.forEach((rule) => {
			const category = rule.category || "other";
			if (!(category in categories)) {
				categories[category] = [];
			}
			categories[category].push(rule);
		});

		renderDocsProcessor.extraData.rules = categories;
		renderDocsProcessor.extraData.presets = availablePresets;
	}
};
