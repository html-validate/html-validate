function fixHeading(src) {
	return src.replace(/^# html-validate changelog/, "# Changelog");
}

function prepare(src) {
	return fixHeading(src);
}

module.exports = function changelogFileReader() {
	return {
		name: "changelogFileReader",
		getDocs: function(fileInfo) {
			return [
				{
					docType: "changelog",
					title: "Changelog",
					content: prepare(fileInfo.content),
					startingLine: 1,
				},
			];
		},
	};
};
