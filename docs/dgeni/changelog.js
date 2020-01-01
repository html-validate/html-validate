const preamble = `
@ngdoc changelog
@name Changelog
@description

`;

function fixHeading(src) {
	return src.replace(/^# html-validate changelog/, "# Changelog");
}

function dropUpcoming(src) {
	return src.replace(/^## Upcoming release$[^]*?^(?=## )/m, "");
}

function prepare(src) {
	src = fixHeading(src);
	src = dropUpcoming(src);
	return preamble + src;
}

module.exports = function changelogFileReader() {
	return {
		name: "changelogFileReader",
		getDocs: function(fileInfo) {
			return [
				{
					content: prepare(fileInfo.content),
					startingLine: 1,
				},
			];
		},
	};
};
