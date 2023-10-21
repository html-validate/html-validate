const path = require("node:path");
const sass = require("sass");

/**
 * @param {string} pkgName
 * @returns {string}
 */
function pkgRootDir(pkgName) {
	return path.dirname(require.resolve(`${pkgName}/package.json`));
}

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

	grunt.registerTask("docs", "Build documentation app", [
		"sass",
		"postcss",
		"copy",
		"browserify",
		"dgeni",
	]);

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		sass: {
			options: {
				implementation: sass,
				includePaths: [
					path.join(pkgRootDir("@fortawesome/fontawesome-free"), "scss"),
					"node_modules/bootstrap-sass/assets/stylesheets/",
					"node_modules/highlight.js/scss/",
				],
			},
			default: {
				src: "docs/app/docs.scss",
				dest: "public/assets/docs.css",
			},
		},

		postcss: {
			options: {
				processors: [require("autoprefixer"), require("cssnano")],
			},
			default: {
				src: "<%=sass.default.dest%>",
				dest: "public/assets/docs.min.css",
			},
		},

		copy: {
			fontawesome: {
				expand: true,
				cwd: path.join(pkgRootDir("@fortawesome/fontawesome-free"), "webfonts"),
				src: "*",
				dest: "public/assets/fonts/",
			},
			glyphicons: {
				expand: true,
				cwd: "node_modules/bootstrap-sass/assets/fonts/bootstrap",
				src: "*",
				dest: "public/assets/fonts/",
			},
			favicon: {
				expand: true,
				cwd: "docs/app",
				src: "favicon.ico",
				dest: "public/",
			},
		},

		browserify: {
			default: {
				options: {
					transform: [
						[
							"babelify",
							{
								presets: ["@babel/preset-env"],
							},
						],
					],
				},
				src: "docs/app/index.js",
				dest: "public/assets/docs.js",
			},
		},
	});
};
