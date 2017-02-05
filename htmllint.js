#!/usr/bin/env nodejs
'use strict';

const HtmlLint = require('./build/src/htmllint').default;
const formatter = require('eslint/lib/formatters/stylish');

const htmllint = new HtmlLint({
	rules: {
		'attr-quotes': 'error',
		'close-attr': 'error',
		'close-order': 'error',
	},
});

let args = process.argv.slice(2);
let results = [];
let valid = true;

args.forEach(function(filename){
	try {
		let report = htmllint.file(filename);

		/* aggregate results */
		valid = valid && report.valid;
		results = results.concat(report.results);
	} catch (e){
		process.stderr.write(e.message + "\n");
		process.exit(1);
	}
});

process.stdout.write(formatter(results));
process.exit(valid ? 0 : 1);
