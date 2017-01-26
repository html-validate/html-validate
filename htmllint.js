#!/usr/bin/env nodejs
'use strict';

const HtmlLint = require('./src/htmllint');
const htmllint = new HtmlLint({
	rules: {
		'attr-quotes': 'error',
		'close-attr': 'error',
		'close-order': 'error',
	},
});

let args = process.argv.slice(2);
args.forEach(function(filename){
	let report = {};
	htmllint.file(filename, report);
	if ( !report.valid ){
		console.log(report.error);
	}
});
