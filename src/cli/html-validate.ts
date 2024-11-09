/* eslint-disable no-console, n/no-process-exit, sonarjs/no-duplicate-string -- as expected from a cli app */
import fs from "fs";
import path from "node:path";
import kleur from "kleur";
import minimist from "minimist";
import { SchemaValidationError, UserError } from "..";
import { name, version, bugs as pkgBugs } from "../generated/package";
import { CLI } from "./cli";
import { handleSchemaValidationError } from "./errors";
import { Mode, modeToFlag } from "./mode";
import { lint } from "./actions/lint";
import { init } from "./actions/init";
import { printConfig } from "./actions/print-config";
import { dump } from "./actions/dump";

interface ParsedArgs {
	config?: string;
	"dump-events": boolean;
	"dump-source": boolean;
	"dump-tokens": boolean;
	"dump-tree": boolean;
	ext: string;
	formatter: string;
	help: boolean;
	init: boolean;
	"max-warnings"?: string;
	preset?: string;
	"print-config": boolean;
	rule?: string;
	stdin: boolean;
	"stdin-filename"?: string;
	version: boolean;
}

function getMode(argv: Record<string, any>): Mode {
	if (argv.init) {
		return Mode.INIT;
	}

	if (argv["dump-events"]) {
		return Mode.DUMP_EVENTS;
	}

	if (argv["dump-source"]) {
		return Mode.DUMP_SOURCE;
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

function requiresFilename(mode: Mode): boolean {
	switch (mode) {
		case Mode.LINT:
			return true;
		case Mode.INIT:
			return false;
		case Mode.DUMP_EVENTS:
		case Mode.DUMP_TOKENS:
		case Mode.DUMP_TREE:
		case Mode.DUMP_SOURCE:
		case Mode.PRINT_CONFIG:
			return true;
	}
}

function handleUserError(err: UserError): void {
	const formatted = err.prettyFormat();
	if (formatted) {
		console.error(); /* blank line */
		console.error(formatted);
		return;
	}

	console.error(kleur.red("Caught exception:"));
	console.group();
	{
		console.error(err.prettyFormat() ?? err);
	}
	console.groupEnd();
}

function handleUnknownError(err: unknown): void {
	console.error(kleur.red("Caught exception:"));
	console.group();
	{
		console.error(err);
	}
	console.groupEnd();
	const bugUrl = `${pkgBugs}?issuable_template=Bug`;
	console.error(kleur.red(`This is a bug in ${name}-${version}.`));
	console.error(
		kleur.red(
			[
				`Please file a bug at ${bugUrl}`,
				`and include this message in full and if possible the content of the`,
				`file being parsed (or a reduced testcase).`,
			].join("\n"),
		),
	);
}

const argv = minimist<ParsedArgs>(process.argv.slice(2), {
	string: [
		"c",
		"config",
		"ext",
		"f",
		"formatter",
		"max-warnings",
		"p",
		"preset",
		"rule",
		"stdin-filename",
	],
	boolean: [
		"init",
		"dump-events",
		"dump-source",
		"dump-tokens",
		"dump-tree",
		"h",
		"help",
		"print-config",
		"stdin",
		"version",
	],
	alias: {
		c: "config",
		f: "formatter",
		p: "preset",
		h: "help",
	},
	default: {
		ext: "html",
		formatter: "stylish",
	},
	unknown: (opt: string) => {
		if (opt.startsWith("-")) {
			process.stderr.write(`unknown option ${opt}\n`);
			process.exit(1);
		}
		return true;
	},
});

function showUsage(): void {
	process.stdout.write(`${name}-${version}
Usage: html-validate [OPTIONS] [FILENAME..] [DIR..]

Common options:
      --ext=STRING               specify file extensions (commaseparated).
  -f, --formatter=FORMATTER      specify the formatter to use.
      --max-warnings=INT         number of warnings to trigger nonzero exit code
  -p, --preset=STRING            configuration preset to use, use
                                 comma-separator for multiple presets. (default:
                                 "recommended")
      --rule=RULE:SEVERITY       set additional rule, use comma separator for
                                 multiple.
      --stdin                    process markup from stdin.
      --stdin-filename=STRING    specify filename to report when using stdin

Miscellaneous:
  -c, --config=STRING            use custom configuration file.
      --init                     initialize project with a new configuration
      --print-config             output configuration for given file.
  -h, --help                     show help.
      --version                  show version.

Debugging options:
      --dump-events              output events during parsing.
      --dump-source              output post-transformed source data.
      --dump-tokens              output tokens from lexing stage.
      --dump-tree                output nodes from the dom tree.

Formatters:

Multiple formatters can be specified with a comma-separated list,
e.g. "json,checkstyle" to enable both.

To capture output to a file use "formatter=/path/to/file",
e.g. "checkstyle=dist/html-validate.xml"
`);
}

function showVersion(): void {
	process.stdout.write(`${name}-${version}\n`);
}

if (argv.stdin) {
	argv._.push("-");
}

if (argv.version) {
	showVersion();
	process.exit();
}

if (argv.help) {
	showUsage();
	process.exit();
}

if (argv._.length === 0) {
	const mode = getMode(argv);
	if (mode === Mode.LINT) {
		showUsage();
		process.exit(0);
	} else if (requiresFilename(mode)) {
		const flag = modeToFlag(mode);
		console.error(`\`${flag}\` requires a filename.`);
		process.exit(1);
	}
}

/* check that supplied config file exists before creating CLI */
if (typeof argv.config !== "undefined") {
	const checkPath = path.resolve(argv.config);
	if (!fs.existsSync(checkPath)) {
		console.log(`The file "${String(argv.config)}" was not found.`);
		console.log(`The location this file was checked for at was: "${String(checkPath)}"`);
		process.exit(1);
	}
}

const cli = new CLI({
	configFile: argv.config,
	preset: argv.preset,
	rules: argv.rule,
});
const mode = getMode(argv);
const formatter = cli.getFormatter(argv.formatter);
const maxWarnings = parseInt(argv["max-warnings"] ?? "-1", 10);
const htmlvalidate = cli.getValidator();

/* sanity check: ensure maxWarnings has a valid value */
if (isNaN(maxWarnings)) {
	console.log(`Invalid value "${String(argv["max-warnings"])}" given to --max-warnings`);
	process.exit(1);
}

/* parse extensions (used when expanding directories) */
const extensions = argv.ext.split(",").map((cur: string) => {
	return cur.startsWith(".") ? cur.slice(1) : cur;
});

const files = cli.expandFiles(argv._, { extensions });
if (files.length === 0 && mode !== Mode.INIT) {
	console.error("No files matching patterns", argv._);
	process.exit(1);
}

async function run(): Promise<void> {
	try {
		let success: boolean;
		if (mode === Mode.LINT) {
			success = await lint(htmlvalidate, process.stdout, files, {
				formatter,
				maxWarnings,
				stdinFilename: argv["stdin-filename"] ?? false,
			});
		} else if (mode === Mode.INIT) {
			success = await init(cli, process.stdout, { cwd: process.cwd() });
		} else if (mode === Mode.PRINT_CONFIG) {
			success = await printConfig(htmlvalidate, process.stdout, files);
		} else {
			success = await dump(htmlvalidate, process.stdout, files, mode);
		}
		process.exit(success ? 0 : 1);
	} catch (err) {
		if (err instanceof SchemaValidationError) {
			handleSchemaValidationError(console, err);
		} else if (err instanceof UserError) {
			handleUserError(err);
		} else {
			handleUnknownError(err);
		}
		process.exit(1);
	}
}

run().catch((err: unknown) => {
	console.error(err);
	process.exit(1);
});
