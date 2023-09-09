module.exports = function alertWarningInlineTagDef() {
	return {
		name: "alert-warning",
		description: "Add bootstrap warning alert",
		handler(doc, tagName, tagDescription) {
			return `<div class="alert alert-warning"><i class="fa-solid fa-exclamation-triangle" aria-hidden="true"></i> ${tagDescription}</div>`;
		},
	};
};
