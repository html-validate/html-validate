module.exports = function(grunt){
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.registerTask('test', ['eslint', 'mochaTest']);
	grunt.registerTask('default', ['test']);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		eslint: {
			build: [
				'*.js',
				'src/**/*.js',
				'test/**/*.js',
			],
		},

		mochaTest: {
			options: {
				require: 'ts-node/register',
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
