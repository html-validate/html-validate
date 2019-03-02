module.exports = function highlightFilter(highlight) {
	return {
		name: "highlight",
		process: (code, lang) => {
			return highlight(code, lang);
		},
	};
};
