import kleur from "kleur";
import { type HtmlValidate, type Report, type Result, Reporter } from "../..";
import { type PerformanceResult } from "../../performance";
import { type WritableStreamLike } from "../writable-stream-like";

export interface LintOptions {
	formatter: (report: Report) => string;
	maxWarnings: number;
	performance: boolean;
	stdinFilename: false | string;
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
			reports.push(await htmlvalidate.validateFile(filename));
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
