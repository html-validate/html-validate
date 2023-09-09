module.exports = function alertSucccessInlineTagDef() {
	return {
		name: "alert-success",
		description: "Add bootstrap success alert",
		handler(doc, tagName, tagDescription) {
			return `<div class="alert alert-success"><i class="fa-solid fa-check" aria-hidden="true"></i> ${tagDescription}</div>`;
		},
	};
};
