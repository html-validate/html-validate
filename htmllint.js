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
let report = {};

args.forEach(function(filename){
	try {
		htmllint.file(filename, report);
	} catch (e){
		console.error(e.message);
	}
});

console.log(formatter(report.results));
