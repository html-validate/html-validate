#!/usr/bin/env nodejs
'use strict';

const HtmlValidate = require('./build/htmlvalidate').default;
const pkg = require('./package.json');
const argv = require('minimist')(process.argv.slice(2), {
	string: ['f', 'formatter', 'rule'],
	boolean: ['dump-events', 'dump-tokens', 'dump-tree'],
	alias: {
		f: 'formatter',
	},
	default: {
		formatter: 'stylish',
	},
});

function showUsage(){
	process.stdout.write(`${pkg.name}-${pkg.version}
Usage: html-validate [OPTIONS] [FILENAME..] [DIR..]

Common options:

  -f, --formatter=FORMATTER   specify the formatter to use.
      --rule=RULE             set additional rule.

Debugging options:
      --dump-events           output events during parsing.
      --dump-tokens           output tokens from lexing stage.
      --dump-tree             output nodes from the dom tree.
`);
}

if (argv.h || argv.help){
	showUsage();
	process.exit();
}

/* prepare config */
const config = {
	extends: ['htmlvalidate:recommended'],
};
if (argv.rule){
	if (Array.isArray(argv.rule)){
		argv.rule = argv.rule.join(',');
	}
	const raw = argv.rule.split(',').map(x => x.replace(/ *(.*):/, '"$1":')).join(',');
	try {
		const rules = JSON.parse(`{${raw}}`);
		config.extends = [];
		config.rules = rules;
	} catch (e){
		process.stderr.write(`Error while parsing "${argv.rule}": ${e.message}, rules ignored.\n`);
	}
}

/* load formatter */
argv.formatter = argv.formatter.replace(/[^a-z]+/g, '');
const formatter = require(`./build/formatters/${argv.formatter}`);

const htmlvalidate = new HtmlValidate(config);

let results = [];
let valid = true;
let mode = 'lint';

if (argv['dump-events']){
	mode = 'dump-events';
}

if (argv['dump-tokens']){
	mode = 'dump-tokens';
}

if (argv['dump-tree']){
	mode = 'dump-tree';
}

argv._.forEach(function(filename){
	const report = htmlvalidate.file(filename, mode);

	/* aggregate results */
	valid = valid && report.valid;
	results = results.concat(report.results);
});

process.stdout.write(formatter(results));
process.exit(valid ? 0 : 1);
