module.exports = function alertSucccessInlineTagDef() {
	return {
		name: "alert-success",
		description: "Add bootstrap success alert",
		handler: function (doc, tagName, tagDescription) {
			return `<div class="alert alert-success"><i class="fa fa-check" aria-hidden="true"></i> ${tagDescription}</div>`;
		},
	};
};
