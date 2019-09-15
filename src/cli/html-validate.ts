/* eslint-disable no-console, no-process-exit, sonarjs/no-duplicate-string */
import { ConfigData } from "../config";
import defaultConfig from "../config/default";
import { TokenDump } from "../engine";
import { UserError } from "../error/user-error";
import HtmlValidate from "../htmlvalidate";
import { Report, Reporter, Result } from "../reporter";
import { expandFiles } from "./expand-files";
import { getFormatter } from "./formatter";
import { eventFormatter } from "./json";

const pkg = require("../../package.json");

import chalk from "chalk";
import minimist from "minimist";

enum Mode {
	LINT,
	DUMP_EVENTS,
	DUMP_TOKENS,
	DUMP_TREE,
	PRINT_CONFIG,
}

function getMode(argv: { [key: string]: any }): Mode {
	if (argv["dump-events"]) {
		return Mode.DUMP_EVENTS;
	}

	if (argv["dump-tokens"]) {
		return Mode.DUMP_TOKENS;
	}

	if (argv["dump-tree"]) {
		return Mode.DUMP_TREE;
	}

	if (argv["print-config"]) {
		return Mode.PRINT_CONFIG;
	}

	return Mode.LINT;
}

function getGlobalConfig(
	configFile: string,
	rules?: string | string[]
): ConfigData {
	const baseConfig: ConfigData = configFile
		? require(`${process.cwd()}/${configFile}`)
		: defaultConfig;
	const config: any = Object.assign({}, baseConfig);
	if (rules) {
		if (Array.isArray(rules)) {
			rules = rules.join(",");
		}
		const raw = rules
			.split(",")
			.map((x: string) => x.replace(/ *(.*):/, '"$1":'))
			.join(",");
		try {
			const rules = JSON.parse(`{${raw}}`);
			config.extends = [];
			config.rules = rules;
		} catch (e) {
			process.stderr.write(
				`Error while parsing "${rules}": ${e.message}, rules ignored.\n`
			);
		}
	}
	return config;
}

function lint(files: string[]): Report {
	const reports = files.map((filename: string) => {
		try {
			return htmlvalidate.validateFile(filename);
		} catch (err) {
			console.error(chalk.red(`Validator crashed when parsing "${filename}"`));
			throw err;
		}
	});
	return Reporter.merge(reports);
}

function dump(files: string[], mode: Mode): string {
	let lines: string[][] = [];
	switch (mode) {
		case Mode.DUMP_EVENTS:
			lines = files.map((filename: string) =>
				htmlvalidate.dumpEvents(filename).map(eventFormatter)
			);
			break;
		case Mode.DUMP_TOKENS:
			lines = files.map((filename: string) =>
				htmlvalidate.dumpTokens(filename).map((entry: TokenDump) => {
					const data = JSON.stringify(entry.data);
					return `TOKEN: ${entry.token}\n  Data: ${data}\n  Location: ${entry.location}`;
				})
			);
			break;
		case Mode.DUMP_TREE:
			lines = files.map((filename: string) => htmlvalidate.dumpTree(filename));
			break;
		default:
			throw new Error(`Unknown mode "${mode}"`);
	}
	const flat = lines.reduce((s: string[], c: string[]) => s.concat(c), []);
	return flat.join("\n");
}

function renameStdin(report: Report, filename: string): void {
	const stdin = report.results.find(
		(cur: Result) => cur.filePath === "/dev/stdin"
	);
	if (stdin) {
		stdin.filePath = filename;
	}
}

const argv: minimist.ParsedArgs = minimist(process.argv.slice(2), {
	string: [
		"c",
		"config",
		"f",
		"formatter",
		"max-warnings",
		"rule",
		"stdin-filename",
	],
	boolean: ["dump-events", "dump-tokens", "dump-tree", "print-config", "stdin"],
	alias: {
		c: "config",
		f: "formatter",
	},
	default: {
		formatter: "stylish",
	},
});

function showUsage(): void {
	const pkg = require("../../package.json");
	process.stdout.write(`${pkg.name}-${pkg.version}
Usage: html-validate [OPTIONS] [FILENAME..] [DIR..]

Common options:
  -f, --formatter=FORMATTER      specify the formatter to use.
      --max-warnings=INT         number of warnings to trigger nonzero exit code
      --rule=RULE:SEVERITY       set additional rule, use comma separator for
                                 multiple.
      --stdin                    process markup from stdin.
      --stdin-filename=STRING    specify filename to report when using stdin

Debugging options:
      --dump-events              output events during parsing.
      --dump-tokens              output tokens from lexing stage.
      --dump-tree                output nodes from the dom tree.

Miscellaneous:
  -c, --config=STRING            use custom configuration file.
      --print-config             output configuration for given file.

Formatters:

Multiple formatters can be specified with a comma-separated list,
e.g. "json,checkstyle" to enable both.

To capture output to a file use "formatter=/path/to/file",
e.g. "checkstyle=build/html-validate.xml"
`);
}

if (argv.stdin) {
	argv._.push("-");
}

if (argv.h || argv.help || argv._.length === 0) {
	showUsage();
	process.exit();
}

const mode = getMode(argv);
const config = getGlobalConfig(argv.config, argv.rule);
const formatter = getFormatter(argv.formatter);
const maxWarnings = parseInt(argv["max-warnings"] || "-1", 10);
const htmlvalidate = new HtmlValidate(config);

/* sanity check: ensure maxWarnings has a valid value */
if (isNaN(maxWarnings)) {
	console.log(
		`Invalid value "${argv["max-warnings"]}" given to --max-warnings`
	);
	process.exit(1);
}

const files = expandFiles(argv._);
if (files.length === 0) {
	console.error("No files matching patterns", argv._);
	process.exit(1);
}

try {
	if (mode === Mode.LINT) {
		const result = lint(files);

		/* rename stdin if an explicit filename was passed */
		if (argv["stdin-filename"]) {
			renameStdin(result, argv["stdin-filename"]);
		}

		process.stdout.write(formatter(result));

		if (maxWarnings >= 0 && result.warningCount > maxWarnings) {
			console.log(
				`\nhtml-validate found too many warnings (maxiumum: ${maxWarnings}).`
			);
			result.valid = false;
		}

		process.exit(result.valid ? 0 : 1);
	} else if (mode === Mode.PRINT_CONFIG) {
		const config = htmlvalidate.getConfigFor(files[0]);
		const json = JSON.stringify(config.get(), null, 2);
		console.log(json);
	} else {
		const output = dump(files, mode);
		console.log(output);
		process.exit(0);
	}
} catch (err) {
	console.error(chalk.red("Caught exception:"));
	if (console.group) console.group();
	{
		console.error(err);
	}
	if (console.group) console.groupEnd();
	if (!(err instanceof UserError)) {
		const bugUrl = `${pkg.bugs.url}?issuable_template=Bug`;
		console.error(chalk.red(`This is a bug in ${pkg.name}-${pkg.version}.`));
		console.error(
			chalk.red(
				`Please file a bug at ${bugUrl}\nand include this message in full and if possible the content of the\nfile being parsed (or a reduced testcase).`
			)
		);
	}
	process.exit(1);
}
