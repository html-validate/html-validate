const path = require("path");
const sass = require("sass");
const serveStatic = require("serve-static");

module.exports = function(grunt) {
	require("load-grunt-tasks")(grunt);

	grunt.registerTask("test", ["jest"]);
	grunt.registerTask("default", ["build"]);

	grunt.registerTask("jest", "exec:jest");

	grunt.registerTask("dgeni", "Generate documentation", function() {
		const Dgeni = require("dgeni");
		const done = this.async();
		const dgeni = new Dgeni([require("./docs/dgeni")]);
		dgeni.generate().then(done);
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

		clean: {
			default: ["build", "public"],
		},

		sass: {
			options: {
				implementation: sass,
				includePaths: [
					"node_modules/font-awesome/scss/",
					"node_modules/bootstrap-sass/assets/stylesheets/",
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
			fonts: {
				expand: true,
				cwd: "node_modules/font-awesome/fonts",
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

		exec: {
			jest: `${path.join("node_modules", ".bin", "jest")} -i --colors --ci`,
		},

		connect: {
			options: {
				port: 3400,
				hostname: "localhost",
				keepalive: true,
				base: "public",
				middleware: function() {
					return [serveStatic("public")];
				},
			},
			default: {},
		},
	});
};
