module.exports = function (grunt) {
	require("load-grunt-tasks")(grunt, {
		config: require.resolve("./package.json"),
	});

	grunt.registerTask("default", ["build"]);

	grunt.registerTask("dgeni", "Generate documentation", function () {
		const done = this.async();
		const { build } = require("./build");
		build()
			.then(done)
			.catch((err) => {
				console.error(err);
				grunt.fatal("Dgeni failed to generate docs");
			});
	});

	grunt.registerTask("docs", "Build documentation app", ["dgeni"]);

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
	});
};
