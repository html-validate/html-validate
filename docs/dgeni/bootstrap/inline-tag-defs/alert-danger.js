module.exports = function alertDangerInlineTagDef() {
	return {
		name: "alert-danger",
		description: "Add bootstrap danger alert",
		handler(doc, tagName, tagDescription) {
			return `<div class="alert alert-danger"><i class="fa-solid fa-exclamation-triangle" aria-hidden="true"></i> ${tagDescription}</div>`;
		},
	};
};
