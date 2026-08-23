import fs from "node:fs/promises";
import kleur from "kleur";
import { type ErrorFixer, type HtmlValidate, type Report, type Result, Reporter } from "../..";
import { type PerformanceResult } from "../../performance";
import { type WritableStreamLike } from "../writable-stream-like";

export interface LintOptions {
	fix: boolean;
	formatter: (report: Report) => string;
	maxWarnings: number;
	performance: boolean;
	stdinFilename: false | string;
}

/**
 * Safety cap to avoid looping forever if a fix never converges.
 *
 * @internal
 */
export const MAX_FIX_ITERATIONS = 1000;

function findFirstAutofix(report: Report): ((fixer: ErrorFixer) => void | Promise<void>) | null {
	for (const result of report.results) {
		for (const message of result.messages) {
			if (message.fix) {
				return message.fix;
			}
		}
	}
	return null;
}

/**
 * Validate a file, repeatedly applying the first autofixable error and
 * re-validating the patched result, until no autofixable errors remains, a fix
 * makes no change to the file or `MAX_FIX_ITERATIONS` is reached.
 */
async function fixFile(htmlvalidate: HtmlValidate, filename: string): Promise<Report> {
	let report = await htmlvalidate.validateFile(filename);
	let fix = findFirstAutofix(report);
	if (!fix) {
		return report;
	}

	/* baseline used to detect whether a fix made any progress, i.e. actually
	 * changed the content of the file */
	const baseline = await htmlvalidate.autofixFile(filename, () => {
		/* no-op */
	});
	const seen = new Set([baseline]);

	let iterations = 0;
	while (fix && iterations < MAX_FIX_ITERATIONS) {
		const patched = await htmlvalidate.autofixFile(filename, fix);
		if (seen.has(patched)) {
			break;
		}
		await fs.writeFile(filename, patched, "utf-8");
		seen.add(patched);
		report = await htmlvalidate.validateFile(filename);
		fix = findFirstAutofix(report);
		iterations++;
	}

	return report;
}

function formatMs(ms: number): string {
	return `${ms.toFixed(2)}ms`;
}

function formatPerformanceTable(
	nameHeader: string,
	entries: Array<{ name: string; count: number; time: number }>,
	totalTime: number,
): string {
	const nameWidth = Math.max(nameHeader.length, ...entries.map((e) => e.name.length)) + 2;
	const countWidth = Math.max(5, ...entries.map((e) => String(e.count).length)) + 2;
	const header = `  ${nameHeader.padEnd(nameWidth)}${"count".padStart(countWidth)}  ${"time(ms)".padStart(10)}  ${"time(%)".padStart(8)}`;
	const separator = `  ${"─".repeat(header.length - 2)}`;
	const rows = entries.map((entry) => {
		const pct = totalTime > 0 ? ((entry.time / totalTime) * 100).toFixed(1) : "0.0";
		const pctStr = `${pct}%`;
		return `  ${entry.name.padEnd(nameWidth)}${String(entry.count).padStart(countWidth)}  ${formatMs(entry.time).padStart(10)}  ${pctStr.padStart(8)}`;
	});
	return [header, separator, ...rows].join("\n");
}

function formatPerformanceResult(result: PerformanceResult): string {
	const totalEventTime = result.events.reduce((sum, e) => sum + e.time, 0);
	const totalRuleTime = result.rules.reduce((sum, e) => sum + e.time, 0);
	const { configTime, transformTime, totalTime } = result;
	const eventEntries = result.events.map((e) => ({ name: e.event, count: e.count, time: e.time }));
	const ruleEntries = result.rules.map((e) => ({ name: e.rule, count: e.count, time: e.time }));
	const lines = [
		"Performance",
		"",
		"Events:",
		formatPerformanceTable("event", eventEntries, totalTime),
		"",
		"Rules:",
		formatPerformanceTable("rule", ruleEntries, totalTime),
		"",
		`Total:     ${formatMs(totalTime)}`,
		`  Config:    ${formatMs(configTime)}`,
		`  Transform: ${formatMs(transformTime)}`,
		`  Events:    ${formatMs(totalEventTime - totalRuleTime)}`,
		`  Rules:     ${formatMs(totalRuleTime)}`,
		"",
	];
	return lines.join("\n");
}

function renameStdin(report: Report, filename: string): void {
	const stdin = report.results.find((cur: Result) => cur.filePath === "/dev/stdin");
	if (stdin) {
		stdin.filePath = filename;
	}
}

export async function lint(
	htmlvalidate: HtmlValidate,
	stdout: WritableStreamLike,
	stderr: WritableStreamLike,
	files: string[],
	options: LintOptions,
): Promise<boolean> {
	if (options.performance) {
		htmlvalidate.startPerformance();
	}

	const reports: Report[] = [];
	for (const filename of files) {
		try {
			const report = options.fix
				? await fixFile(htmlvalidate, filename)
				: await htmlvalidate.validateFile(filename);
			reports.push(report);
		} catch (err) {
			const message = kleur.red(`Validator crashed when parsing "${filename}"`);
			stdout.write(`${message}\n`);
			throw err;
		}
	}

	const merged = Reporter.merge(reports);

	/* rename stdin if an explicit filename was passed */
	if (options.stdinFilename) {
		renameStdin(merged, options.stdinFilename);
	}

	stdout.write(options.formatter(merged));

	if (options.performance) {
		const performanceResult = htmlvalidate.stopPerformance();
		stderr.write(formatPerformanceResult(performanceResult));
	}

	if (options.maxWarnings >= 0 && merged.warningCount > options.maxWarnings) {
		stdout.write(
			`\nhtml-validate found too many warnings (maximum: ${String(options.maxWarnings)}).\n`,
		);
		return false;
	}

	return merged.valid;
}
