const hljs = require("highlight.js");

module.exports = function highlight() {
	function configure(options) {
		hljs.configure(options);
	}

	function render(code, lang) {
		if (typeof lang !== "undefined") {
			return hljs.highlight(lang, code).value;
		} else {
			return hljs.highlightAuto(code).value;
		}
	}

	render.configure = configure;

	return render;
};
