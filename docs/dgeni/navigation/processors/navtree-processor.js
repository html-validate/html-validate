function haveNavigation(doc) {
	/* explicitly turned off */
	if (doc.nav === false) {
		return false;
	}

	const enabled = ["content", "rule", "rules", "presets", "migration"];
	const disabled = [
		"changelog",
		"error",
		"frontpage",
		"schema",
		"inlineValidation",
		"validate-public",
		"validate-spec",
	];

	if (enabled.includes(doc.docType)) {
		return true;
	}

	if (disabled.includes(doc.docType)) {
		return false;
	}

	throw new Error(`Unhandled doctype "${doc.docType}" when processing navigation tree`);
}

function guessNavCategory(doc) {
	/* use explicit if present */
	if (doc.nav) {
		return doc.nav;
	}

	switch (doc.docType) {
		case "migration":
			return "userguide";
		case "rule":
		case "rules":
		case "presets":
			return "rules";
	}

	return null;
}

module.exports = function navtreeProcessor(getDocFromAlias, log) {
	const navtree = require("../../../navigation");

	return {
		$runAfter: ["paths-computed"],
		$runBefore: ["rendering-docs"],
		$process,
	};

	function isActive(target, currentDoc) {
		const docs = getDocFromAlias(target, currentDoc);
		if (docs.length > 0) {
			return docs[0].id === currentDoc.id;
		} else {
			return false;
		}
	}

	function normalizeItem(item, doc) {
		if (item.children) {
			return {
				...item,
				active: item.children.some((it) => isActive(it.target, doc)),
				children: item.children.map((it) => normalizeItem(it, doc)),
			};
		} else {
			return {
				...item,
				active: isActive(item.target, doc),
			};
		}
	}

	function $process(docs) {
		for (const doc of docs) {
			if (!haveNavigation(doc)) {
				continue;
			}
			const category = guessNavCategory(doc);
			if (!category) {
				const { docType, fileInfo } = doc;
				const { projectRelativePath } = fileInfo;
				log.warn(`Failed to determine navtree for "${projectRelativePath}" (${docType})`);
				continue;
			}
			const selectedTree = navtree[category];
			doc.navtree = {
				category,
				title: selectedTree.title,
				items: selectedTree.items.map((it) => normalizeItem(it, doc)),
			};
		}
	}
};
