/** @todo this will break when typescript is actually used */
const recommended = require("../../../src/config/recommended.ts");
const document = require("../../../src/config/document.ts");

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
			doc.ruleSourcePath = docPath
				.replace("docs", "src")
				.replace(/\.md$/, ".ts");
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
				recommended: !!recommended.rules[doc.name],
				document: !!document.rules[doc.name],
			}))
			.sort(compareName);

		/* group rules into categories */
		const categories = {};
		rules.forEach((rule) => {
			const category = rule.category || "other";
			if (!(category in categories)) {
				categories[category] = [];
			}
			categories[category].push(rule);
		});

		renderDocsProcessor.extraData.rules = categories;
	}
};
