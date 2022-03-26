/* eslint-disable no-console, no-process-exit, sonarjs/no-duplicate-string */
import path from "path";
import kleur from "kleur";
import minimist from "minimist";
import { TokenDump, SchemaValidationError, UserError, Report, Reporter, Result } from "..";
import { name, version, bugs as pkgBugs } from "../generated/package";
import { eventFormatter } from "./json";
import { CLI } from "./cli";

enum Mode {
	LINT,
	INIT,
	DUMP_EVENTS,
	DUMP_TOKENS,
	DUMP_TREE,
	DUMP_SOURCE,
	PRINT_CONFIG,
}

function getMode(argv: { [key: string]: any }): Mode {
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

function modeToFlag(mode: Mode.LINT): null;
function modeToFlag(mode: Exclude<Mode, Mode.LINT>): string;
function modeToFlag(mode: Mode): string | null {
	switch (mode) {
		case Mode.LINT:
			return null;
		case Mode.INIT:
			return "--init";
		case Mode.DUMP_EVENTS:
			return "--dump-events";
		case Mode.DUMP_TOKENS:
			return "--dump-tokens";
		case Mode.DUMP_TREE:
			return "--dump-tokens";
		case Mode.DUMP_SOURCE:
			return "--dump-source";
		case Mode.PRINT_CONFIG:
			return "--print-config";
	}
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

function lint(files: string[]): Report {
	const reports = files.map((filename: string) => {
		try {
			return htmlvalidate.validateFile(filename);
		} catch (err) {
			console.error(kleur.red(`Validator crashed when parsing "${filename}"`));
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
		case Mode.DUMP_SOURCE:
			lines = files.map((filename: string) => htmlvalidate.dumpSource(filename));
			break;
		default:
			throw new Error(`Unknown mode "${mode}"`);
	}
	const flat = lines.reduce((s: string[], c: string[]) => s.concat(c), []);
	return flat.join("\n");
}

function renameStdin(report: Report, filename: string): void {
	const stdin = report.results.find((cur: Result) => cur.filePath === "/dev/stdin");
	if (stdin) {
		stdin.filePath = filename;
	}
}

function handleValidationError(err: SchemaValidationError): void {
	if (err.filename) {
		const filename = path.relative(process.cwd(), err.filename);
		console.log(kleur.red(`A configuration error was found in "${filename}":`));
	} else {
		console.log(kleur.red(`A configuration error was found:`));
	}
	console.group();
	{
		console.log(err.prettyError());
	}
	console.groupEnd();
}

function handleUserError(err: UserError): void {
	console.error(kleur.red("Caught exception:"));
	console.group();
	{
		console.error(err);
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
			].join("\n")
		)
	);
}

const argv: minimist.ParsedArgs = minimist(process.argv.slice(2), {
	string: ["c", "config", "ext", "f", "formatter", "max-warnings", "rule", "stdin-filename"],
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
		h: "help",
	},
	default: {
		formatter: "stylish",
	},
	unknown: (opt: string) => {
		if (opt[0] === "-") {
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

const cli = new CLI({
	configFile: argv.config,
	rules: argv.rule,
});
const mode = getMode(argv);
const formatter = cli.getFormatter(argv.formatter);
const maxWarnings = parseInt(argv["max-warnings"] || "-1", 10);
const htmlvalidate = cli.getValidator();

/* sanity check: ensure maxWarnings has a valid value */
if (isNaN(maxWarnings)) {
	console.log(`Invalid value "${String(argv["max-warnings"])}" given to --max-warnings`);
	process.exit(1);
}

/* parse extensions (used when expanding directories) */
const extensions = (argv.ext || "html").split(",").map((cur: string) => {
	return cur[0] === "." ? cur.slice(1) : cur;
});

const files = cli.expandFiles(argv._, { extensions });
if (files.length === 0 && mode !== Mode.INIT) {
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
			console.log(`\nhtml-validate found too many warnings (maxiumum: ${maxWarnings}).`);
			result.valid = false;
		}

		process.exit(result.valid ? 0 : 1);
	} else if (mode === Mode.INIT) {
		cli
			.init(process.cwd())
			.then((result) => {
				console.log(`Configuration written to "${result.filename}"`);
			})
			.catch((err) => {
				if (err) {
					console.error(err);
				}
				process.exit(1);
			});
	} else if (mode === Mode.PRINT_CONFIG) {
		if (files.length > 0) {
			console.error(`\`${modeToFlag(mode)}\` expected a single filename but got multiple:`, files);
			process.exit(1);
		}
		const config = htmlvalidate.getConfigFor(files[0]);
		const json = JSON.stringify(config.get(), null, 2);
		console.log(json);
	} else {
		const output = dump(files, mode);
		console.log(output);
		process.exit(0);
	}
} catch (err) {
	if (err instanceof SchemaValidationError) {
		handleValidationError(err);
	} else if (err instanceof UserError) {
		handleUserError(err);
	} else {
		handleUnknownError(err);
	}
	process.exit(1);
}
