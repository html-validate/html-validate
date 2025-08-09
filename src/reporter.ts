import { Severity } from "./config";
import { type Location, type Source } from "./context";
import { type Rule } from "./rule";
import { type DOMNode } from "./dom";
import { type Message } from "./message";
import { isThenable } from "./utils";

/**
 * @public
 */
export interface DeferredMessage extends Omit<Message, "selector"> {
	selector: () => string | null;
}

function freeze(src: DeferredMessage): Message {
	return {
		...src,
		selector: src.selector(),
	};
}

function isThenableArray<T>(value: T[] | Array<Promise<T>>): value is Array<Promise<T>> {
	if (value.length === 0) {
		return false;
	}
	return isThenable(value[0]);
}

/**
 * @public
 */
export interface Result {
	messages: Message[];
	filePath: string;
	errorCount: number;
	warningCount: number;
	source: string | null;
}

/**
 * Report object returned by [[HtmlValidate]].
 *
 * @public
 */
export interface Report {
	/** `true` if validation was successful */
	valid: boolean;

	/** Detailed results per validated source */
	results: Result[];

	/** Total number of errors across all sources */
	errorCount: number;

	/** Total warnings of errors across all sources */
	warningCount: number;
}

/**
 * @public
 */
export class Reporter {
	protected result: Record<string, DeferredMessage[]>;

	public constructor() {
		this.result = {};
	}

	/**
	 * Merge two or more reports into a single one.
	 *
	 * @param reports- Reports to merge.
	 * @returns A merged report.
	 */
	public static merge(reports: Report[]): Report;

	/**
	 * Merge two or more reports into a single one.
	 *
	 * @param reports- Reports to merge.
	 * @returns A promise resolved with the merged report.
	 */
	public static merge(reports: Promise<Report[]> | Array<Promise<Report>>): Promise<Report>;

	public static merge(
		reports: Report[] | Promise<Report[]> | Array<Promise<Report>>,
	): Report | Promise<Report> {
		if (isThenable(reports)) {
			return reports.then((reports) => this.merge(reports));
		}
		if (isThenableArray(reports)) {
			return Promise.all(reports).then((reports) => this.merge(reports));
		}
		const valid = reports.every((report) => report.valid);
		const merged: Record<string, Result> = {};
		reports.forEach((report: Report) => {
			report.results.forEach((result: Result) => {
				const key = result.filePath;
				if (key in merged) {
					merged[key].messages = [...merged[key].messages, ...result.messages];
				} else {
					merged[key] = { ...result };
				}
			});
		});
		const results: Result[] = Object.values(merged).map((result: Result) => {
			/* recalculate error- and warning-count */
			result.errorCount = countErrors(result.messages);
			result.warningCount = countWarnings(result.messages);
			return result;
		});
		return {
			valid,
			results,
			errorCount: sumErrors(results),
			warningCount: sumWarnings(results),
		};
	}

	public add<ContextType, OptionsType>(
		rule: Rule<ContextType, OptionsType>,
		message: string,
		severity: number,
		node: DOMNode | null,
		location: Location,
		context: ContextType,
	): void {
		if (!(location.filename in this.result)) {
			this.result[location.filename] = [];
		}
		const ruleUrl = rule.documentation(context)?.url;
		const entry: DeferredMessage = {
			ruleId: rule.name,
			severity,
			message,
			offset: location.offset,
			line: location.line,
			column: location.column,
			size: location.size || 0,
			selector() {
				return node ? node.generateSelector() : null;
			},
		};
		if (ruleUrl) {
			entry.ruleUrl = ruleUrl;
		}
		if (context) {
			entry.context = context;
		}
		this.result[location.filename].push(entry);
	}

	public addManual(filename: string, message: DeferredMessage): void {
		if (!(filename in this.result)) {
			this.result[filename] = [];
		}
		this.result[filename].push(message);
	}

	public save(sources?: Source[]): Report {
		const report: Report = {
			valid: this.isValid(),
			results: Object.keys(this.result).map((filePath) => {
				const messages = Array.from(this.result[filePath], freeze).sort(messageSort);
				const source = (sources ?? []).find((source: Source) => filePath === source.filename);
				return {
					filePath,
					messages,
					errorCount: countErrors(messages),
					warningCount: countWarnings(messages),
					source: source ? (source.originalData ?? source.data) : null,
				};
			}),
			errorCount: 0,
			warningCount: 0,
		};
		report.errorCount = sumErrors(report.results);
		report.warningCount = sumWarnings(report.results);
		return report;
	}

	protected isValid(): boolean {
		const numErrors = Object.values(this.result).reduce((sum, messages) => {
			return sum + countErrors(messages);
		}, 0);
		return numErrors === 0;
	}
}

function countErrors(messages: Array<Message | DeferredMessage>): number {
	/* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion -- technical debt */
	return messages.filter((m) => m.severity === Number(Severity.ERROR)).length;
}

function countWarnings(messages: Array<Message | DeferredMessage>): number {
	/* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion -- technical debt */
	return messages.filter((m) => m.severity === Number(Severity.WARN)).length;
}

function sumErrors(results: Result[]): number {
	return results.reduce((sum: number, result: Result) => {
		return sum + result.errorCount;
	}, 0);
}

function sumWarnings(results: Result[]): number {
	return results.reduce((sum: number, result: Result) => {
		return sum + result.warningCount;
	}, 0);
}

function messageSort(a: Message, b: Message): number {
	if (a.line < b.line) {
		return -1;
	}

	if (a.line > b.line) {
		return 1;
	}

	if (a.column < b.column) {
		return -1;
	}

	if (a.column > b.column) {
		return 1;
	}

	return 0;
}

export default Reporter;
