module.exports = function alertInfoInlineTagDef() {
	return {
		name: "alert-info",
		description: "Add bootstrap info alert",
		handler(doc, tagName, tagDescription) {
			return `<div class="alert alert-info"><i class="fa-solid fa-info-circle" aria-hidden="true"></i> ${tagDescription}</div>`;
		},
	};
};
