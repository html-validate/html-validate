const path = require('path');
const eslintStrict = process.env.ESLINT_STRICT === '1';

module.exports = function(grunt){
	require('load-grunt-tasks')(grunt);
	grunt.loadTasks('tasks');

	grunt.registerTask('test', ['eslint', 'mochaTest', 'smoketest']);
	grunt.registerTask('build', ['ts', 'test']);
	grunt.registerTask('build:ci', ['ts']); /* CI runs test in separate stage */
	grunt.registerTask('default', ['build']);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		ts: {
			default: {
				options: {
					rootDir: 'src',
				},
				tsconfig: './tsconfig.json',
			},
		},

		eslint: {
			default: {
				options: {
					/* CI pipeline sets strict environment do disallow any warnings, but
					 * allows warnings in development environment to not cause
					 * annoyances. */
					maxWarnings: eslintStrict ? 0 : -1,
				},
				src: [
					'*.js',
					'src/**/*.ts',
				],
			},
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

		smoketest: {
			config: {
				src: 'test-files/config/**/*.html',
			},
			rules: {
				options: {
					args: filename => {
						const s = path.parse(filename);
						return ['--rule', `${s.name}: 2`];
					},
				},
				src: 'test-files/rules/*.html',
			},
		},
	});
};
