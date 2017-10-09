const fs = require('fs');
const path = require('path');
const columnify = require('columnify');
const spawnSync = require('child_process').spawnSync;
const eslintStrict = process.env.ESLINT_STRICT === '1';

module.exports = function(grunt){
	require('load-grunt-tasks')(grunt);

	grunt.registerTask('test', ['eslint', 'mochaTest', 'smoketest']);
	grunt.registerTask('build', ['ts', 'test']);
	grunt.registerTask('build:ci', ['ts']); /* CI runs test in separate stage */
	grunt.registerTask('default', ['build']);
	grunt.registerMultiTask('smoketest', smoketest);

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
			default: {
				src: 'test-files/rules/*.html',
			},
		},
	});

	function smoketest(){
		this.files.forEach(target => {
			target.src.forEach(filename => {
				const s = path.parse(filename);
				grunt.log.write(`  Testing "${s.name}" .. `);
				const result = spawnSync('./html-validate.js', [
					'--rule', `${s.name}: 2`,
					'--formatter', 'json',
					filename,
				]);

				/* the rule should fail with an error */
				if (result.status === 0){
					grunt.log.error();
					grunt.fatal(`Expected "${s.name}" to report an error`);
				}

				/* validate output */
				const compare = `${s.dir}/${s.name}.json`;
				const expected = fs.readFileSync(compare, {encoding: 'utf-8'});
				const expectedObj = JSON.parse(expected);
				const actual = result.stdout.toString('utf-8');
				let actualObj;

				try {
					actualObj = JSON.parse(actual);
				} catch (e) {
					grunt.log.error(actual);
					return;
				}

				if (expected !== actual){
					grunt.log.error();
					grunt.log.writeln('  Expected:');
					grunt.log.writeln(reportTable(expectedObj[0]).replace(/^/gm, '    '));
					grunt.log.writeln('  Actual:');
					grunt.log.writeln(reportTable(actualObj[0]).replace(/^/gm, '    '));
					grunt.log.writeln(`  stderr: ${result.stderr.toString('utf-8')}`);
					grunt.fatal(`Expected "${s.name}" to report correct error`);
				}

				grunt.log.ok();
			});
		});
	}
};

function reportTable(report){
	const lines = report.messages.map(row => ({
		filename: `${report.filePath}:${row.line}:${row.column}`,
		message: row.message,
	}));
	return columnify(lines, {
		columnSplitter: ' | ',
	});
}
