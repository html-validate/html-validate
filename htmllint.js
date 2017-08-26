#!/usr/bin/env nodejs
'use strict';

const HtmlLint = require('./build/htmllint').default;
const formatter = require('eslint/lib/formatters/stylish');
const pkg = require('./package.json');
const argv = require('minimist')(process.argv.slice(2), {
	'boolean': ['dump-tokens'],
});

function showUsage(){
	process.stdout.write(`${pkg.name}-${pkg.version}
Usage: htmllint [OPTIONS] [FILENAME..] [DIR..]

Debugging options:
      --dump-tokens      Output tokens from lexing stage.
`);
}

if (argv.h || argv.help){
	showUsage();
	process.exit();
}

const htmllint = new HtmlLint({
	extends: ['htmllint:recommended'],
});

let results = [];
let valid = true;
let mode = 'lint';

if (argv['dump-tokens']){
	mode = 'dump-tokens';
}

argv._.forEach(function(filename){
	const report = htmllint.file(filename, mode);

	/* aggregate results */
	valid = valid && report.valid;
	results = results.concat(report.results);
});

process.stdout.write(formatter(results));
process.exit(valid ? 0 : 1);
