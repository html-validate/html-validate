module.exports = function migrationFileReader() {
	return {
		name: "migrationFileReader",
		getDocs: function (fileInfo) {
			return [
				{
					docType: "migration",
					title: "Migration guide",
					content: fileInfo.content,
					startingLine: 1,
				},
			];
		},
	};
};
