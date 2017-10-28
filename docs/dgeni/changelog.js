const preamble = `
@ngdoc changelog
@module usage
@name Changelog
@description

`;

function fixHeading(src){
	return src.replace(/^# html-validate changelog/, '# Changelog');
}

module.exports = function changelogFileReader() {
	return {
		name: 'changelogFileReader',
		getDocs: function(fileInfo){
			return [
				{
					content: preamble + fixHeading(fileInfo.content),
					startingLine: 1,
				},
			];
		},
	};
};
