import HtmlValidate from '../htmlvalidate';
import { Result } from '../reporter'; // eslint-disable-line no-unused-vars

const minimist = require('minimist');

function getMode(argv: { [key: string]: any }){
	if (argv['dump-events']){
		return 'dump-events';
	}

	if (argv['dump-tokens']){
		return 'dump-tokens';
	}

	if (argv['dump-tree']){
		return 'dump-tree';
	}

	return 'lint';
}

function getGlobalConfig(rules?: string|string[]){
	const config: any = Object.assign({}, require('./config'));
	if (rules){
		if (Array.isArray(rules)){
			rules = rules.join(',');
		}
		const raw = rules.split(',').map((x: string) => x.replace(/ *(.*):/, '"$1":')).join(',');
		try {
			const rules = JSON.parse(`{${raw}}`);
			config.extends = [];
			config.rules = rules;
		} catch (e){
			process.stderr.write(`Error while parsing "${rules}": ${e.message}, rules ignored.\n`);
		}
	}
	return config;
}

function getFormatter(name: string){
	name = name.replace(/[^a-z]+/g, '');
	return require(`../formatters/${name}`);
}

const argv = minimist(process.argv.slice(2), {
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
	const pkg = require('../../package.json');
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

const mode = getMode(argv);
const config = getGlobalConfig(argv.rule);
const formatter = getFormatter(argv.formatter);
const htmlvalidate = new HtmlValidate(config);

let results: Result[] = [];
let valid = true;

argv._.forEach((filename: string) => {
	const report = htmlvalidate.file(filename, mode);

	/* aggregate results */
	valid = valid && report.valid;
	results = results.concat(report.results);
});

process.stdout.write(formatter(results));
process.exit(valid ? 0 : 1);
