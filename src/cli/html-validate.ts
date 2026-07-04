/* eslint-disable no-console, n/no-process-exit -- as expected from a cli app */
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import kleur from "kleur";
import { type UserErrorData, SchemaValidationError, isUserError } from "..";
import { bugs as pkgBugs, name, version } from "../generated/package-json";
import { dump } from "./actions/dump";
import { init } from "./actions/init";
import { lint } from "./actions/lint";
import { printConfig } from "./actions/print-config";
import { CLI } from "./cli";
import { ImportResolveMissingError, handleSchemaValidationError } from "./errors";
import { haveImportMetaResolve } from "./have-import-meta-resolve";
import { Mode, modeToFlag } from "./mode";

function getMode(argv: Record<string, unknown>): Mode {
	if (argv["init"]) {
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

function handleUserError(err: UserErrorData): void {
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

const { values: argv, positionals } = (() => {
	try {
		return parseArgs({
			args: process.argv.slice(2),
			options: {
				config: { type: "string" as const, short: "c" },
				"dump-events": { type: "boolean" as const, default: false },
				"dump-source": { type: "boolean" as const, default: false },
				"dump-tokens": { type: "boolean" as const, default: false },
				"dump-tree": { type: "boolean" as const, default: false },
				ext: { type: "string" as const, default: "html" },
				formatter: { type: "string" as const, short: "f", default: "stylish" },
				help: { type: "boolean" as const, short: "h", default: false },
				init: { type: "boolean" as const, default: false },
				"max-warnings": { type: "string" as const },
				performance: { type: "boolean" as const, default: false },
				preset: { type: "string" as const, short: "p" },
				"print-config": { type: "boolean" as const, default: false },
				rule: { type: "string" as const },
				stdin: { type: "boolean" as const, default: false },
				"stdin-filename": { type: "string" as const },
				version: { type: "boolean" as const, default: false },
			},
			allowPositionals: true,
			strict: true,
		});
	} catch (err) {
		process.stderr.write(`${(err as Error).message}\n`);
		process.exit(1);
	}
})();

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
      --performance              output performance data after validation.

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
	positionals.push("-");
}

if (argv.version) {
	showVersion();
	process.exit();
}

if (argv.help) {
	showUsage();
	process.exit();
}

if (positionals.length === 0) {
	const mode = getMode(argv);
	if (mode === Mode.LINT) {
		showUsage();
		process.exit(0);
	}
	if (requiresFilename(mode)) {
		const flag = modeToFlag(mode);
		console.error(`\`${flag}\` requires a filename.`);
		process.exit(1);
	}
}

/* check that supplied config file exists before creating CLI */
if (argv.config !== undefined) {
	const checkPath = path.resolve(argv.config);
	if (!fs.existsSync(checkPath)) {
		console.error(`The file "${argv.config}" was not found.`);
		console.error(`The location this file was checked for at was: "${checkPath}"`);
		process.exit(1);
	}
}

/* eslint-disable-next-line complexity -- for now */
async function run(): Promise<void> {
	const cli = new CLI({
		configFile: argv.config,
		preset: argv.preset,
		rules: argv.rule,
	});
	const mode = getMode(argv);
	const formatter = await cli.getFormatter(argv.formatter);
	const maxWarnings = Math.trunc(Number(argv["max-warnings"] ?? "-1"));
	const htmlvalidate = await cli.getValidator();

	/* sanity check: ensure maxWarnings has a valid value */
	if (Number.isNaN(maxWarnings)) {
		console.error(`Invalid value "${String(argv["max-warnings"])}" given to --max-warnings`);
		process.exit(1);
	}

	/* parse extensions (used when expanding directories) */
	const extensions = argv.ext.split(",").map((cur: string) => {
		return cur.startsWith(".") ? cur.slice(1) : cur;
	});

	const files = await cli.expandFiles(positionals, { extensions });
	if (files.length === 0 && mode !== Mode.INIT) {
		console.error("No files matching patterns", positionals);
		process.exit(1);
	}

	try {
		/* istanbul ignore next -- not tested with unittests */
		if (!haveImportMetaResolve()) {
			throw new ImportResolveMissingError();
		}

		let success: boolean;
		switch (mode) {
			case Mode.LINT: {
				success = await lint(htmlvalidate, process.stdout, process.stderr, files, {
					formatter,
					maxWarnings,
					performance: argv.performance,
					stdinFilename: argv["stdin-filename"] ?? false,
				});
				break;
			}
			case Mode.INIT: {
				success = await init(cli, process.stdout, { cwd: process.cwd() });
				break;
			}
			case Mode.PRINT_CONFIG: {
				success = await printConfig(htmlvalidate, process.stdout, files);
				break;
			}
			default: {
				success = await dump(htmlvalidate, process.stdout, files, mode);
			}
		}
		process.exit(success ? 0 : 1);
	} catch (err) {
		if (err instanceof SchemaValidationError) {
			handleSchemaValidationError(console, err);
		} else if (isUserError(err)) {
			handleUserError(err);
		} else {
			handleUnknownError(err);
		}
		process.exit(1);
	}
}

/* eslint-disable-next-line unicorn/prefer-top-level-await, unicorn/prefer-await -- technical debt, as long as we bundle and ship commonjs we cannot use TLA here */
run().catch((err: unknown) => {
	console.error(err);
	process.exit(1);
});
