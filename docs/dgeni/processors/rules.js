const a17y = require("../../../dist/config/presets/a17y");
const document = require("../../../dist/config/presets/document");
const recommended = require("../../../dist/config/presets/recommended");
const standard = require("../../../dist/config/presets/standard");

/* sort order */
const availablePresets = ["recommended", "standard", "a17y", "document"];

/* preset configuration */
const presets = {
	a17y,
	document,
	recommended,
	standard,
};

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
	return doc.docType === "rule";
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
					const config = presets[presetName];
					if (config && config.rules) {
						result[presetName] = Boolean(config.rules[doc.name]);
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
