module.exports = function(grunt){
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks("grunt-ts");

	grunt.registerTask('test', ['eslint', 'mochaTest']);
	grunt.registerTask('build', ['ts', 'test']);
	grunt.registerTask('build:ci', ['ts']); /* CI runs test in separate stage */
	grunt.registerTask('default', ['build']);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		ts: {
			build: {
				tsconfig: './tsconfig.json',
			},
		},

		eslint: {
			build: [
				'*.js',
				'src/**/*.js',
				'src/**/*.ts',
				'test/**/*.ts',
			],
		},

		mochaTest: {
			options: {
				require: [
					'ts-node/register',
					'tsconfig-paths/register',
				],
			},
			test: {
				src: [
					'test/**/*.spec.js',
					'test/**/*.spec.ts',
				],
			},
		},

	});
};
