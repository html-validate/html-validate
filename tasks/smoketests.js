const fs = require('fs');
const path = require('path');
const spawnSync = require('child_process').spawnSync;
const columnify = require('columnify');

module.exports = function(grunt){
	grunt.registerMultiTask('smoketest', smoketest);

	function smoketest(){
		const options = this.options({
			args: () => [],
		});
		this.files.forEach(target => {
			target.src.forEach(filename => {
				const s = path.parse(filename);
				grunt.log.write(`  Testing "${filename}" .. `);
				const args = options.args(filename).concat([
					'--formatter', 'json',
					filename,
				]);
				grunt.log.debug(` (${args.join(' ')})`);
				const result = spawnSync('./bin/html-validate.js', args);

				if (result.error){
					grunt.fatal(result.error);
					return;
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
					grunt.log.writeln('  Command args:');
					grunt.log.writeln('    ', args.join(' '));
					grunt.log.writeln('  Output:');
					grunt.log.writeln(`    stderr: ${result.stderr.toString('utf-8')}`);
					grunt.fatal(`Expected "${s.name}" to report correct error`);
				}

				grunt.log.ok();
			});
		});
	}

	function reportTable(report){
		const lines = report.messages.map(row => ({
			filename: `${report.filePath}:${row.line}:${row.column}`,
			severity: row.severity,
			message: row.message,
		}));
		return columnify(lines, {
			columnSplitter: ' | ',
		});
	}

};
