import kleur from "kleur";
import { type HtmlValidate, type Report, type Result, Reporter } from "../..";
import { type WritableStreamLike } from "../writable-stream-like";

export interface LintOptions {
	formatter: (report: Report) => string;
	maxWarnings: number;
	stdinFilename: false | string;
}

function renameStdin(report: Report, filename: string): void {
	const stdin = report.results.find((cur: Result) => cur.filePath === "/dev/stdin");
	if (stdin) {
		stdin.filePath = filename;
	}
}

export async function lint(
	htmlvalidate: HtmlValidate,
	output: WritableStreamLike,
	files: string[],
	options: LintOptions,
): Promise<boolean> {
	const reports = files.map(async (filename: string) => {
		try {
			return await htmlvalidate.validateFile(filename);
		} catch (err) {
			const message = kleur.red(`Validator crashed when parsing "${filename}"`);
			output.write(`${message}\n`);
			throw err;
		}
	});

	const merged = await Reporter.merge(reports);

	/* rename stdin if an explicit filename was passed */
	if (options.stdinFilename) {
		renameStdin(merged, options.stdinFilename);
	}

	output.write(options.formatter(merged));

	if (options.maxWarnings >= 0 && merged.warningCount > options.maxWarnings) {
		output.write(`\nhtml-validate found too many warnings (maximum: ${options.maxWarnings}).\n`);
		return false;
	}

	return merged.valid;
}
