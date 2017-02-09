#!/usr/bin/env nodejs
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const HtmlLint = require('./build/src/htmllint').default;
const formatter = require('eslint/lib/formatters/stylish');
const pkg = require('./package.json');

function showUsage(){
	process.stdout.write(`${pkg.name}-${pkg.version}\nUsage: htmllint [OPTIONS] [FILENAME..] [DIR..]\n`);
}

if ( argv.h || argv.help ){
	showUsage();
	process.exit();
}

const htmllint = new HtmlLint({
	extends: ['htmllint:recommended'],
});

let results = [];
let valid = true;

argv._.forEach(function(filename){
	let report = htmllint.file(filename);

	/* aggregate results */
	valid = valid && report.valid;
	results = results.concat(report.results);
});

process.stdout.write(formatter(results));
process.exit(valid ? 0 : 1);
