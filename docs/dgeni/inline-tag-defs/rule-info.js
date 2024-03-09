const categoryName = {
	"content-model": "Content model",
	a11y: "Accessibility",
	deprecated: "Deprecated",
	security: "Security",
	seo: "SEO",
	style: "Style",
	syntax: "HTML Syntax and concepts",
	document: "Document",
};

const standardsName = {
	html5: "HTML5",
	"wcag-2.2-aaa": "WCAG 2.2 (AAA)",
	"wcag-2.2-aa": "WCAG 2.2 (AA)",
	"wcag-2.2-a": "WCAG 2.2 (A)",
	"wcag-2.1-aaa": "WCAG 2.1 (AAA)",
	"wcag-2.1-aa": "WCAG 2.1 (AA)",
	"wcag-2.1-a": "WCAG 2.1 (A)",
	"wcag-2.0-aaa": "WCAG 2.0 (AAA)",
	"wcag-2.0-aa": "WCAG 2.0 (AA)",
	"wcag-2.0-a": "WCAG 2.0 (A)",
	"wai-aria": "WAI ARIA",
	"html-aria": "ARIA in HTML",
	csp: "Content Security Policy",
	sri: "Subresource Integrity",
};

/**
 * @param  {Object} url   The url to match
 * @param  {Function} docs error message
 * @return {String}  The html link information
 * @property {boolean} relativeLinks Whether we expect the links to be relative to the originating doc
 */
function ruleInfoInlineTagDef() {
	return {
		name: "ruleInfo",
		handler(doc) {
			if (doc.docType !== "rule") {
				throw new Error("{@ruleInfo} can only be used on document with docType rule");
			}
			const unset = `<span class="rule-info-unset">-</span>`;
			const category = categoryName[doc.category] ?? unset;
			const standards =
				doc.standards.length > 0
					? doc.standards
							.map((it) => {
								return `<span class="rule-info-standards--${it}">${standardsName[it] ?? it}</span>`;
							})
							.join(", ")
					: unset;
			return /* HTML */ `
				<dl class="rule-info">
					<dt>Rule ID:</dt>
					<dd class="rule-info-id">${doc.name}</dd>
					<dt>Category:</dt>
					<dd class="rule-info-category">${category}</dd>
					<dt>Standards:</dt>
					<dd class="rule-info-standards">${standards}</dd>
				</dl>
			`;
		},
	};
}

module.exports = ruleInfoInlineTagDef;
