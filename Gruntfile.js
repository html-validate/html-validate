module.exports = function(grunt){
	require('load-grunt-tasks')(grunt);

	grunt.registerTask('test', ['eslint', 'mochaTest']);
	grunt.registerTask('build', ['ts', 'test']);
	grunt.registerTask('build:ci', ['ts']); /* CI runs test in separate stage */
	grunt.registerTask('default', ['build']);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		ts: {
			build: {
				options: {
					rootDir: 'src',
				},
				tsconfig: './tsconfig.json',
			},
		},

		eslint: {
			build: [
				'*.js',
				'src/**/*.ts',
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
					'src/**/*.spec.ts',
				],
			},
		},

	});
};
