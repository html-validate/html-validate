module.exports = function migrationFileReader() {
	return {
		name: "migrationFileReader",
		getDocs(fileInfo) {
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
