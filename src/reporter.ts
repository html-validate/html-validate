import { Severity } from "./config";
import { type Source } from "./context";
import { type DOMNode } from "./dom";
import { type Location, assertValidLocation } from "./location";
import { type Message } from "./message";
import { type RuleDocumentation } from "./rule";
import { isThenable } from "./utils/is-thenable";

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

	/**
	 * Number of errors which can be automatically fixed.
	 *
	 * @since %version%
	 */
	fixableErrorCount: number;

	/**
	 * Number of warnings which can be automatically fixed.
	 *
	 * @since %version%
	 */
	fixableWarningCount: number;

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

	/**
	 * Number of errors which can be automatically fixed.
	 *
	 * @since %version%
	 */
	fixableErrorCount: number;

	/**
	 * Number of warnings which can be automatically fixed.
	 *
	 * @since %version%
	 */
	fixableWarningCount: number;
}

/**
 * @public
 */
export class Reporter {
	/**
	 * @internal
	 */
	protected result: Record<string, DeferredMessage[]>;

	/**
	 * @internal
	 */
	public constructor() {
		this.result = {};
	}

	/**
	 * Merge two or more reports into a single one.
	 *
	 * @public
	 * @param reports- Reports to merge.
	 * @returns A merged report.
	 */
	public static merge(reports: Report[]): Report;

	/**
	 * Merge two or more reports into a single one.
	 *
	 * @public
	 * @param reports- Reports to merge.
	 * @returns A promise resolved with the merged report.
	 */
	public static merge(reports: Promise<Report[]> | Array<Promise<Report>>): Promise<Report>;

	public static merge(
		reports: Report[] | Promise<Report[]> | Array<Promise<Report>>,
	): Report | Promise<Report> {
		if (isThenable(reports)) {
			/* eslint-disable-next-line unicorn/prefer-await -- intentional, we must return sync result if sync parameters are used */
			return reports.then((reports) => this.merge(reports));
		}
		if (isThenableArray(reports)) {
			/* eslint-disable-next-line unicorn/prefer-await -- intentional, we must return sync result if sync parameters are used */
			return Promise.all(reports).then((reports) => this.merge(reports));
		}
		const valid = reports.every((report) => report.valid);
		const merged: Record<string, Result> = {};
		for (const report of reports) {
			for (const result of report.results) {
				const key = result.filePath;
				if (Object.hasOwn(merged, key)) {
					merged[key].messages = [...merged[key].messages, ...result.messages];
				} else {
					merged[key] = { ...result };
				}
			}
		}
		const results: Result[] = Object.values(merged).map((result: Result) => {
			/* recalculate error- and warning-count */
			result.errorCount = countErrors(result.messages);
			result.warningCount = countWarnings(result.messages);
			result.fixableErrorCount = countFixableErrors(result.messages);
			result.fixableWarningCount = countFixableWarnings(result.messages);
			return result;
		});
		return {
			valid,
			results,
			errorCount: sumErrors(results),
			warningCount: sumWarnings(results),
			fixableErrorCount: sumFixableErrors(results),
			fixableWarningCount: sumFixableWarnings(results),
		};
	}

	/**
	 * @internal
	 */
	public add<ContextType>(options: {
		rule: {
			name: string;
			documentation(context: ContextType): RuleDocumentation | null;
		};
		message: string;
		severity: number;
		node: DOMNode | null;
		location: Location;
		context: ContextType;
		fix?: Message["fix"] | null | undefined;
		suggestions?: Message["suggestions"] | null | undefined;
	}): void {
		const { rule, message, severity, node, location, context, fix, suggestions } = options;
		assertValidLocation(location);
		if (!Object.hasOwn(this.result, location.filename)) {
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
			size: location.size,
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
		if (fix) {
			entry.fix = fix;
		}
		if (suggestions) {
			entry.suggestions = suggestions;
		}
		this.result[location.filename].push(entry);
	}

	/**
	 * @internal
	 */
	public addManual(filename: string, message: DeferredMessage): void {
		if (!Object.hasOwn(this.result, filename)) {
			this.result[filename] = [];
		}
		this.result[filename].push(message);
	}

	/**
	 * @internal
	 */
	public save(sources?: Source[]): Report {
		const report: Report = {
			valid: this.isValid(),
			/* eslint-disable-next-line unicorn/prefer-object-iterable-methods -- technical debt */
			results: Object.keys(this.result).map((filePath) => {
				const messages = Array.from(this.result[filePath], freeze).toSorted(messageSort);
				const source = (sources ?? []).find((source: Source) => filePath === source.filename);
				return {
					filePath,
					messages,
					errorCount: countErrors(messages),
					warningCount: countWarnings(messages),
					fixableErrorCount: countFixableErrors(messages),
					fixableWarningCount: countFixableWarnings(messages),
					source: source ? (source.originalData ?? source.data) : null,
				};
			}),
			errorCount: 0,
			warningCount: 0,
			fixableErrorCount: 0,
			fixableWarningCount: 0,
		};
		report.errorCount = sumErrors(report.results);
		report.warningCount = sumWarnings(report.results);
		report.fixableErrorCount = sumFixableErrors(report.results);
		report.fixableWarningCount = sumFixableWarnings(report.results);
		return report;
	}

	/**
	 * @internal
	 */
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

function countFixableErrors(messages: Array<Message | DeferredMessage>): number {
	/* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion -- technical debt */
	return messages.filter((m) => m.fix && m.severity === Number(Severity.ERROR)).length;
}

function countWarnings(messages: Array<Message | DeferredMessage>): number {
	/* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion -- technical debt */
	return messages.filter((m) => m.severity === Number(Severity.WARN)).length;
}

function countFixableWarnings(messages: Array<Message | DeferredMessage>): number {
	/* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion -- technical debt */
	return messages.filter((m) => m.fix && m.severity === Number(Severity.WARN)).length;
}

function sumErrors(results: Result[]): number {
	return results.reduce((sum: number, result: Result) => {
		return sum + result.errorCount;
	}, 0);
}

function sumFixableErrors(results: Result[]): number {
	return results.reduce((sum: number, result: Result) => {
		return sum + result.fixableErrorCount;
	}, 0);
}

function sumWarnings(results: Result[]): number {
	return results.reduce((sum: number, result: Result) => {
		return sum + result.warningCount;
	}, 0);
}

function sumFixableWarnings(results: Result[]): number {
	return results.reduce((sum: number, result: Result) => {
		return sum + result.fixableWarningCount;
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
