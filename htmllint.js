#!/usr/bin/env nodejs
'use strict';

/* eslint-disable no-console */

const HtmlLint = require('./src/htmllint');
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
		console.error(e.message);
		process.exit(1);
	}
});

console.log(formatter(results));
process.exit(valid ? 0 : 1);
