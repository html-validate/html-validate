import HtmlValidate from '../htmlvalidate';
import { Reporter, Report } from '../reporter';
import { getFormatter } from './formatter';
import * as minimist from 'minimist';
import { TokenDump, EventDump } from '../engine';

const glob = require('glob');

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

function lint(files: string[]): Report {
	const reports = files.map((filename: string) => htmlvalidate.validateFile(filename));
	return Reporter.merge(reports);
}

function dump(files: string[], mode: string){
	const filtered = ['parent', 'children'];
	let lines: string[][] = [];
	switch (mode){
	case 'dump-events':
		lines = files.map((filename: string) => htmlvalidate.dumpEvents(filename).map((entry: EventDump) => {
			const strdata = JSON.stringify(entry.data, (key, value) => {
				return filtered.indexOf(key) >= 0 ? '[truncated]' : value;
			}, 2);
			return `${entry.event}: ${strdata}`;
		}));
		break;
	case 'dump-tokens':
		lines = files.map((filename: string) => htmlvalidate.dumpTokens(filename).map((entry: TokenDump) => {
			return `TOKEN: ${entry.token}\n  Data: ${JSON.stringify(entry.data)}\n  Location: ${entry.location}`;
		}));
		break;
	case 'dump-tree':
		lines = files.map((filename: string) => htmlvalidate.dumpTree(filename));
		break;
	default:
		throw new Error(`Unknown mode "${mode}"`);
	}
	const flat = lines.reduce((s: string[], c: string[]) => s.concat(c), []);
	return flat.join('\n');
}

const argv: minimist.ParsedArgs = minimist(process.argv.slice(2), {
	string: ['f', 'formatter', 'rule'],
	boolean: ['dump-events', 'dump-tokens', 'dump-tree', 'stdin'],
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
      --rule=RULE:SEVERITY    set additional rule, use comma separator for
                              multiple.
      --stdin                 process markup from stdin.

Debugging options:
      --dump-events           output events during parsing.
      --dump-tokens           output tokens from lexing stage.
      --dump-tree             output nodes from the dom tree.

Formatters:

Multiple formatters can be specified with a comma-separated list,
e.g. "json,checkstyle" to enable both.

To capture output to a file use "formatter=/path/to/file",
e.g. "checkstyle=build/html-validate.xml"
`);
}

if (argv.stdin){
	argv._.push('/dev/stdin');
}

if (argv.h || argv.help || argv._.length === 0){
	showUsage();
	process.exit();
}

const mode = getMode(argv);
const config = getGlobalConfig(argv.rule);
const formatter = getFormatter(argv.formatter);
const htmlvalidate = new HtmlValidate(config);

const files = argv._.reduce((files: string[], pattern: string) => {
	return files.concat(glob.sync(pattern));
}, []);
const unique = [... new Set(files)];

if (unique.length === 0){
	console.error('No files matching patterns', argv._); // eslint-disable-line no-console
	process.exit(1);
}

if (mode === 'lint'){
	const result = lint(unique);
	formatter(result);
	process.exit(result.valid ? 0 : 1);
} else {
	const output = dump(unique, mode);
	console.log(output); // eslint-disable-line no-console
	process.exit(0);
}
